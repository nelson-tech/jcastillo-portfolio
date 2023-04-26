import Swup from "swup";
import SwupA11yPlugin from "@swup/a11y-plugin";
import SwupHeadPlugin from "@swup/head-plugin";
import SwupSlideTheme from "@swup/slide-theme";
import SwupScriptsPlugin from "@swup/scripts-plugin";
import SwupProgressPlugin from "@swup/progress-plugin";

const swup = new Swup({
  plugins: [
    new SwupA11yPlugin(),
    new SwupScriptsPlugin(),
    // new SwupProgressPlugin(),
    new SwupHeadPlugin(),
    new SwupSlideTheme(),
  ],
});
