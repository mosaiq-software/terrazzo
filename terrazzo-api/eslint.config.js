import pluginJs from "@eslint/js";
import globals from "globals";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    {
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
                allowDefaultProject: ['*.js', '*.mjs', '*.ts'],
            },
        },
    },
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
        ignores: [".node_modules/*", "dist/*", "scripts/*", "*.config.js", "*.config.ts"]
    },
];