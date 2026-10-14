// Comments that narrate what the code used to do, or promise a numbered future
// phase, go stale and get copied by later agents. Git keeps history; the
// roadmap keeps plans. The pattern is in HISTORY below.
const HISTORY = /\b(Previously\b|Old behavior|Phase \d)/;

const commentRules = {
  rules: {
    "no-history-comments": {
      meta: { type: "suggestion", schema: [] },
      create(context) {
        return {
          Program() {
            for (const comment of context.sourceCode.getAllComments()) {
              const match = comment.value.match(HISTORY);
              if (match) {
                context.report({
                  loc: comment.loc,
                  message: `History or plan comment ("${match[1]}"). Git keeps history; the roadmap keeps plans.`,
                });
              }
            }
          },
        };
      },
    },
  },
};

export default commentRules;
