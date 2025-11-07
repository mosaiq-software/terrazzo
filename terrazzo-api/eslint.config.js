import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ["**/*.{js,mjs,cjs,ts}"]},
    {languageOptions: { globals: globals.node }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            eqeqeq: "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
        },
    },
    {
        ignores: [".node_modules/*", "dist/*", "scripts/*", "admin-ui/*"]
    },
];