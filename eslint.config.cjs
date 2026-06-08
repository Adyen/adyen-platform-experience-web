'use strict';

const js = require('@eslint/js');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const importX = require('eslint-plugin-import-x');
const a11y = require('eslint-plugin-jsx-a11y');
const testingLib = require('eslint-plugin-testing-library');
const vue = require('eslint-plugin-vue');
const vueParser = require('vue-eslint-parser');

module.exports = [
    // Global ignores
    {
        ignores: ['**/dist/**', '**/storybook-static/**', '**/coverage/**', '**/static/**'],
    },

    // eslint:recommended base rules
    js.configs.recommended,

    // Disable core ESLint rules that TypeScript handles, then apply TS recommended
    tsPlugin.configs['flat/eslint-recommended'],
    ...tsPlugin.configs['flat/recommended'],

    // React recommended + jsx-runtime (no need for manual import in JSX)
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],

    // React hooks recommended
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: reactHooks.configs.recommended.rules,
    },

    // Main project config
    {
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: Object.fromEntries(Object.entries({ ...globals.browser, ...globals.node, ...globals.es2020 }).map(([k, v]) => [k.trim(), v])),
        },
        plugins: {
            react,
            '@typescript-eslint': tsPlugin,
            'import-x': importX,
            'jsx-a11y': a11y,
            'react-hooks': reactHooks,
        },
        settings: {
            react: {
                version: '17.0',
            },
            'import-x/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
                typescript: {
                    project: './tsconfig.json',
                },
            },
        },
        rules: {
            'no-console': 'off',
            'class-methods-use-this': 'off',
            'no-underscore-dangle': 'off',
            'import-x/prefer-default-export': 'off',
            'no-debugger': 'warn',
            indent: 'off',
            'import-x/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'never',
                    jsx: 'never',
                    ts: 'never',
                    tsx: 'never',
                },
            ],
            'import-x/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: [
                        'stories/**/*',
                        'playwright.config.ts',
                        'vite.config.ts',
                        'config/**/*.ts',
                        'envs/**/*.ts',
                        'mocks/**/*.ts',
                        'packages/**/vite.config.ts',
                        '**/*.test.{ts,tsx}',
                        '{src,packages}/**/{__testing__,testing}/**/*.{ts,tsx}',
                        'packages/domains/*/{domain,preact,vue}/tests/**/*.{ts,tsx}',
                        'packages/domains/*/**/stories/**/*.{ts,tsx}',
                        'packages/domains/*/mocks/**/*.{ts,tsx}',
                        'src/**/*.{ts,tsx}',
                    ],
                    includeTypes: false,
                },
            ],
            'max-len': [
                'error',
                {
                    code: 150,
                    tabWidth: 2,
                    ignoreComments: true,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                },
            ],
            'prefer-destructuring': 'off',
            'arrow-parens': ['error', 'as-needed'],
            'comma-dangle': 'off',
            'operator-linebreak': 'off',
            'implicit-arrow-linebreak': 'off',
            'lines-between-class-members': 'off',
            'object-curly-newline': 'off',
            'no-multiple-empty-lines': 'off',
            radix: 'off',
            'eol-last': 'off',
            'no-useless-constructor': 'off',

            // Typescript Rules
            '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, vars: 'local', argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-member-accessibility': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/indent': 'off',
            '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
            '@typescript-eslint/ban-types': 'off',

            // React Rules
            'react/prop-types': 'off',
            'react/display-name': 'off',
            'react/jsx-no-literals': 'error',
            'react-hooks/exhaustive-deps': 'error',

            // a11y
            'jsx-a11y/alt-text': 'error',
            'jsx-a11y/aria-role': 'error',
            'jsx-a11y/aria-props': 'error',
            'jsx-a11y/aria-unsupported-elements': 'error',
            'jsx-a11y/role-has-required-aria-props': 'error',
            'jsx-a11y/role-supports-aria-props': 'error',
            'jsx-a11y/tabindex-no-positive': 'error',
            'jsx-a11y/no-redundant-roles': 'error',
            'jsx-a11y/anchor-has-content': 'error',
            'jsx-a11y/anchor-is-valid': 'error',
            'jsx-a11y/img-redundant-alt': 'error',
            'jsx-a11y/interactive-supports-focus': 'error',
            'jsx-a11y/autocomplete-valid': 'error',
            'jsx-a11y/no-static-element-interactions': 'error',
            'jsx-a11y/no-noninteractive-tabindex': 'error',
            'jsx-a11y/mouse-events-have-key-events': 'error',
        },
    },

    // Vue Composition API files written as plain .ts (not .vue SFCs)
    {
        files: ['**/vue/src/**/*.{ts,tsx}'],
        rules: {
            'react-hooks/rules-of-hooks': 'off',
            'react-hooks/exhaustive-deps': 'off',
        },
    },

    // .vue files: spread vue flat config
    ...vue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },
        rules: {
            'vue/html-indent': ['warn', 4],
            'vue/max-attributes-per-line': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off',
            'react/jsx-no-literals': 'off',
            'react/display-name': 'off',
            'react/prop-types': 'off',
            'react/no-unknown-property': 'off',
            'react-hooks/rules-of-hooks': 'off',
            'react-hooks/exhaustive-deps': 'off',
        },
    },

    // Explicit member accessibility for TS/TSX files
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'off', overrides: { properties: 'explicit' } }],
        },
    },

    // testing-library rules for test files
    {
        ...testingLib.configs['flat/react'],
        files: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    },
    {
        files: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
        rules: {
            'testing-library/render-result-naming-convention': 'warn',
            'testing-library/no-wait-for-multiple-assertions': 'warn',
            'testing-library/prefer-screen-queries': 'warn',
            'testing-library/no-render-in-lifecycle': 'warn',
            'testing-library/prefer-presence-queries': 'warn',
            'testing-library/no-container': 'warn',
            'testing-library/prefer-find-by': 'warn',
            'testing-library/no-node-access': 'warn',
            'testing-library/no-await-sync-queries': 'warn',
            'testing-library/no-manual-cleanup': 'warn',
        },
    },
    {
        files: ['**/tests/**/*.[jt]s?(x)'],
        plugins: { 'testing-library': testingLib },
        rules: {
            'testing-library/prefer-screen-queries': 'off',
        },
    },

    // Dev-only files inside workspace packages resolve devDependencies from workspace root
    {
        files: ['packages/**/vite.config.ts', 'packages/**/*.test.{ts,tsx}', 'packages/**/{__testing__,testing}/**/*.{ts,tsx}'],
        rules: {
            'import-x/no-extraneous-dependencies': ['error', { devDependencies: true, packageDir: ['.'] }],
        },
    },

    // Playwright fixtures: disable react-hooks rules
    {
        files: ['packages/shared/testing/src/playwright/**/*.ts', 'packages/**/tests/**/*.ts'],
        rules: {
            'react-hooks/rules-of-hooks': 'off',
            'react-hooks/exhaustive-deps': 'off',
        },
    },

    // packages/shared/testing/src: explicit packageDir for import-x
    {
        files: ['packages/shared/testing/src/**/*.{ts,tsx}'],
        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                { devDependencies: ['**/storybook-helpers/**/*.{ts,tsx}'], packageDir: ['packages/shared/testing'] },
            ],
        },
    },

    // packages/tools/storybook: allow devDependencies and peerDependencies
    {
        files: ['packages/tools/storybook/**/*'],
        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                { devDependencies: true, peerDependencies: true, packageDir: ['packages/tools/storybook', '.'] },
            ],
        },
    },

    // Storybook config files use explicit .ts/.js extensions (allowImportingTsExtensions)
    {
        files: ['packages/tools/storybook/src/.storybook/**/*'],
        rules: {
            'import-x/extensions': 'off',
        },
    },
];
