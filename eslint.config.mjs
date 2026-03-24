import eslint from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import css from "@eslint/css";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: { eslint },
        extends: [
            eslint.configs.all,
        ],
        languageOptions:
        {
            globals:
            {
                ...globals.browser,
            }
        },
        rules:
        {
            "consistent-return": "error",
            "curly": "warn",
            "eqeqeq": "error",
            // I don't think that this needs to be an error, a warning is good enough
            "prefer-const": "warn",
            "no-duplicate-imports": "warn",
            "no-useless-assignment": "warn",
            "no-self-compare": "warn",
            "no-template-curly-in-string": "error",

            "no-eq-null": "error",
            "no-implicit-coercion": "error",
            "no-shadow": "error",
            "no-var": "warn",
            "require-await": "error",

            // Disabling rules that I don't really care about.
            "no-console": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-warning-comments": "off",
            "new-cap": "off",
            "max-statements": "off",
            "camelcase": "off",
            "func-style": "off",
            "sort-keys": "off",
            "no-use-before-define": "off",
            "strict": "off",
            "one-var": "off",
            "capitalized-comments": "off",
            "vars-on-top": "off",
            "no-continue": "off",
            "id-length": "off",
        }
    }
]);
