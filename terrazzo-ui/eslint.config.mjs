import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ["**/*.{ts,tsx}"]},
    {languageOptions: { globals: globals.browser }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        rules: {
            eqeqeq: "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
            "@typescript-eslint/no-empty-object-type": "off",
            "react/jsx-key": "error",
            "react/jsx-no-useless-fragment": "warn",
            "react/jsx-pascal-case": "warn",
        }
    },
    {
        ignores: [".node_modules/*", "dist/*", "scripts/*", "*.cjs", "public/*"]
    },
];