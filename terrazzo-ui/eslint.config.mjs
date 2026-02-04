import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig([
    globalIgnores(['dist']),
    {
        ignores: ['*.config.js', '*.config.mjs', '*.config.ts', '*.config.cjs'],
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
                allowDefaultProject: ['*.js', '*.mjs', '*.ts'],
            },
        },
        rules: {
            eqeqeq: "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
            "@typescript-eslint/no-empty-object-type": "off",
            "react-hooks/exhaustive-deps": "off",
            "react-refresh/only-export-components": "off",
        }
    },
])
