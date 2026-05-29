import eslint from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

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
                unsafeWindow: "readonly",
                GM_addStyle: "readonly",
                GM_getResourceText: "readonly",
                Toastify: "readonly"
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
            "no-useless-return": "warn",
            "no-unused-vars": "warn",

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
            "func-names": "off",
            "max-lines-per-function": "off",
            "prefer-rest-params": "off",
            "prefer-destructuring": "off",
            "no-invalid-this": "off",
            // Literally no reason for this limit
            "max-lines": "off",

            // Don't understand this one, should come back to it later
            "prefer-named-capture-group": "off",
            // Don't understand this one either.
            "require-unicode-regexp": "off"
        }
    }
]);
