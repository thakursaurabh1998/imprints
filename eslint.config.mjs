import { defineConfig } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import importPlugin from "eslint-plugin-import";

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
    // eslint-config-next now ships this as a native flat-config array --
    // spread it directly rather than routing it through FlatCompat's
    // legacy-schema validator, which chokes on a circular reference in
    // the bundled eslint-plugin-react config object.
    extends: [
        ...nextCoreWebVitals,
        ...fixupConfigRules(compat.extends(
            "eslint:recommended",
            "prettier",
        )),
    ],

    // eslint-config-next already registers the "import" plugin itself
    // (for import/resolver settings), so pulling in its rules via
    // plugin:import/recommended|typescript would redefine that plugin
    // key and error. Apply just the rule sets, not the plugin
    // registration, from eslint-plugin-import's own flat configs.
    rules: {
        ...importPlugin.flatConfigs.recommended.rules,
        ...importPlugin.flatConfigs.typescript.rules,
        "@next/next/no-img-element": "off",
    },
}, {
    // react-hooks v7 (bundled by eslint-config-next@16) adds React
    // Compiler-derived safety rules. This project doesn't enable the
    // React Compiler (no `reactCompiler` option in next.config.js), so
    // the invariants these two rules check don't apply here, and both
    // flag long-standing "always latest ref" / SSR-guard patterns that
    // are safe under the standard runtime. Off, not fixed -- same
    // treatment as @next/next/no-img-element above.
    files: ["src/**"],
    rules: {
        "react-hooks/refs": "off",
        "react-hooks/set-state-in-effect": "off",
    },
}]);