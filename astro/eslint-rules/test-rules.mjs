// Local ESLint plugin that fails tautological tests: assertions whose outcome
// is fixed by the test itself, so they can never catch a regression.
//   no-constant-assertion  expect(<literal>), expect(x).toBe(x), assert(true),
//                          assert.equal(<literal>, <literal>), expect(1 === 1)
//   no-mock-unit-under-test  vi.mock / jest.mock / mock.module of the module the
//                          test file is named after (foo.test.ts mocking ./foo)
// A real exception can be kept with a reasoned eslint-disable comment.
import path from "node:path";

const MATCHERS_ON_SUBJECT = new Set(["expect", "assert"]);
const ASSERT_BINARY = new Set([
  "equal", "strictEqual", "deepEqual", "deepStrictEqual", "notEqual",
  "notStrictEqual", "notDeepEqual", "notDeepStrictEqual", "is", "eq",
]);
const ASSERT_UNARY = new Set(["ok", "isTrue", "isFalse", "isOk", "isNotOk", "true", "false"]);

function isConstant(node) {
  if (!node) return false;
  switch (node.type) {
    case "Literal":
      return !(node.regex);
    case "TemplateLiteral":
      return node.expressions.length === 0;
    case "Identifier":
      return node.name === "undefined" || node.name === "NaN" || node.name === "Infinity";
    case "UnaryExpression":
      return isConstant(node.argument);
    case "ArrayExpression":
      return node.elements.every((e) => e && e.type !== "SpreadElement" && isConstant(e));
    case "ObjectExpression":
      return node.properties.every(
        (p) => p.type === "Property" && !p.computed && isConstant(p.value),
      );
    case "BinaryExpression":
    case "LogicalExpression":
      return isConstant(node.left) && isConstant(node.right);
    case "TSAsExpression":
    case "TSNonNullExpression":
    case "TSSatisfiesExpression":
      return isConstant(node.expression);
    default:
      return false;
  }
}

function sameExpr(a, b, sourceCode) {
  if (!a || !b) return false;
  if (a.type === "Literal" || isConstant(a)) return false; // handled by isConstant
  return sourceCode.getText(a) === sourceCode.getText(b) && a.type !== "CallExpression" && a.type !== "NewExpression";
}

function selfComparison(node, sourceCode) {
  // x === x, x == x (not NaN checks via !==)
  return node && node.type === "BinaryExpression" && ["===", "=="].includes(node.operator) &&
    sameExpr(node.left, node.right, sourceCode);
}

function calleeName(callee) {
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && !callee.computed) {
    const obj = calleeName(callee.object);
    return obj ? `${obj}.${callee.property.name}` : null;
  }
  return null;
}

// Walk expect(subject).not.resolves.toBe(arg) back to the expect() call.
function findExpectCall(node) {
  let cur = node;
  while (cur && cur.type === "MemberExpression") cur = cur.object;
  if (cur && cur.type === "CallExpression") {
    const n = calleeName(cur.callee);
    if (n === "expect" || n === "expect.soft") return cur;
  }
  return null;
}

const noConstantAssertion = {
  meta: {
    type: "problem",
    docs: { description: "Disallow assertions whose result is fixed by the test itself." },
    schema: [],
    messages: {
      constantSubject: "Tautological test: expect() is given a constant, so it checks nothing in the code under test.",
      selfCompare: "Tautological test: this compares a value with itself.",
      constantAssert: "Tautological test: assert() on constants always gives the same answer.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    return {
      CallExpression(node) {
        const name = calleeName(node.callee);
        // expect(...) chains: report at the matcher call
        if (node.callee.type === "MemberExpression") {
          const exp = findExpectCall(node.callee.object);
          if (exp && node.callee.object !== undefined) {
            const subject = exp.arguments[0];
            const matcher = node.callee.property && node.callee.property.name;
            // expect([allowed values]).toContain(actual) is a membership check on real data.
            const membership = ["toContain", "toContainEqual"].includes(matcher) &&
              node.arguments.length === 1 && !isConstant(node.arguments[0]);
            if (subject && !membership && (isConstant(subject) || selfComparison(subject, sourceCode))) {
              context.report({ node, messageId: isConstant(subject) ? "constantSubject" : "selfCompare" });
              return;
            }
            if (subject && node.arguments.length === 1 && sameExpr(subject, node.arguments[0], sourceCode)) {
              context.report({ node, messageId: "selfCompare" });
              return;
            }
          }
        }
        if (!name) return;
        const [root, method] = name.split(".");
        if (!MATCHERS_ON_SUBJECT.has(root) || root === "expect") return;
        // assert(x), assert.ok(x)
        if (!method || ASSERT_UNARY.has(method)) {
          const a = node.arguments[0];
          if (a && (isConstant(a) || selfComparison(a, sourceCode))) {
            context.report({ node, messageId: "constantAssert" });
          }
          return;
        }
        if (ASSERT_BINARY.has(method)) {
          const [a, b] = node.arguments;
          if (a && b && ((isConstant(a) && isConstant(b)) || sameExpr(a, b, sourceCode))) {
            context.report({ node, messageId: isConstant(a) ? "constantAssert" : "selfCompare" });
          }
        }
      },
    };
  },
};

function unitName(filename) {
  const base = path.basename(filename).replace(/\.(test|spec|e2e)\.[cm]?[jt]sx?$/, "");
  return base === path.basename(filename) ? null : base;
}

const noMockUnitUnderTest = {
  meta: {
    type: "problem",
    docs: { description: "Disallow mocking the module a test file is named after." },
    schema: [],
    messages: {
      mocked: "Tautological test: '{{spec}}' is the unit this file tests, so mocking it tests the mock.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const unit = unitName(filename);
    if (!unit) return {};
    const baseOf = (spec) => path.basename(spec).replace(/\.[cm]?[jt]sx?$/, "");
    const local = (spec) => spec.startsWith(".") || spec.startsWith("@/") || spec.startsWith("~/");
    const imported = new Set();
    const mocks = [];
    const note = (src) => {
      if (src && src.type === "Literal" && typeof src.value === "string") imported.add(src.value);
    };
    return {
      ImportDeclaration(node) { note(node.source); },
      ImportExpression(node) { note(node.source); },
      CallExpression(node) {
        const name = calleeName(node.callee);
        if (!["vi.mock", "jest.mock", "vi.doMock", "jest.doMock", "mock.module", "t.mock.module"].includes(name)) return;
        const arg = node.arguments[0];
        if (!arg || arg.type !== "Literal" || typeof arg.value !== "string" || !local(arg.value)) return;
        if (baseOf(arg.value) === unit) mocks.push({ node, spec: arg.value });
      },
      // Only a problem when the file both imports and mocks its own unit: a route
      // test that mocks a same-named dependency is still testing the route.
      "Program:exit"() {
        for (const m of mocks) {
          if (imported.has(m.spec)) context.report({ node: m.node, messageId: "mocked", data: { spec: m.spec } });
        }
      },
    };
  },
};

export default {
  rules: {
    "no-constant-assertion": noConstantAssertion,
    "no-mock-unit-under-test": noMockUnitUnderTest,
  },
};
