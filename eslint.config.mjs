import { defineConfig } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    // server/ is a standalone Node program with its own tsconfig.json
    // (see server/tsconfig.json) -- not part of the Next app, so it
    // shouldn't be linted against a browser/Next-oriented config.
    ignores: ["server/**"],
}, {
    extends: fixupConfigRules(compat.extends(
        "next/core-web-vitals",
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
    )),

    rules: {
        "@next/next/no-img-element": "off",
    },
}]);