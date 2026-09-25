'use strict';

const { existsSync, readdirSync } = require('node:fs');
const { join, relative } = require('node:path');
const js = require('@eslint/js');
const nx = require('@nx/eslint-plugin');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importX = require('eslint-plugin-import-x');
const testingLib = require('eslint-plugin-testing-library');
const vue = require('eslint-plugin-vue');
const vueParser = require('vue-eslint-parser');

const getWorkspacePackageDirs = (dir = join(__dirname, 'packages'), packageDirs = ['.']) => {
    if (!existsSync(dir)) {
        return packageDirs;
    }

    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || ['dist', 'node_modules', 'storybook-static'].includes(entry.name)) {
            continue;
        }

        const entryPath = join(dir, entry.name);

        if (existsSync(join(entryPath, 'package.json'))) {
            packageDirs.push(relative(__dirname, entryPath));
        }

        getWorkspacePackageDirs(entryPath, packageDirs);
    }

    return packageDirs;
};

const workspacePackageDirs = getWorkspacePackageDirs();

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

    // Main project config
    {
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
            globals: Object.fromEntries(Object.entries({ ...globals.browser, ...globals.node, ...globals.es2020 }).map(([k, v]) => [k.trim(), v])),
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'import-x': importX,
        },
        settings: {
            'import-x/resolver': {
                node: {
                    extensions: ['.js', '.ts'],
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
            'import-x/no-duplicates': 'error',
            'no-debugger': 'warn',
            indent: 'off',
            'import-x/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'never',
                    ts: 'never',
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
                        '**/*.test.ts',
                        '{src,packages}/**/{__testing__,testing}/**/*.ts',
                        'packages/domains/*/{domain,vue}/tests/**/*.ts',
                        'packages/domains/*/**/stories/**/*.ts',
                        'packages/domains/*/{fixtures,mocks}/**/*.ts',
                        'packages/sdk/tests/**/*.ts',
                        'src/**/*.ts',
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
            'vue/html-self-closing': ['warn', { html: { void: 'any', normal: 'always', component: 'always' }, svg: 'always', math: 'always' }],
            'vue/max-attributes-per-line': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off',
        },
    },

    // Explicit member accessibility for TypeScript files
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'off', overrides: { properties: 'explicit' } }],
        },
    },
    {
        files: ['src/index.ts', 'packages/sdk/src/index.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ExportAllDeclaration',
                    message: 'Public SDK entry points must use explicit exports.',
                },
            ],
        },
    },

    // testing-library rules for test files
    {
        ...testingLib.configs['flat/vue'],
        files: ['**/tests/**/*.{js,ts}', '**/?(*.)+(spec|test).{js,ts}'],
    },
    {
        files: ['**/tests/**/*.{js,ts}', '**/?(*.)+(spec|test).{js,ts}'],
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
        files: ['**/tests/**/*.{js,ts}'],
        plugins: { 'testing-library': testingLib },
        rules: {
            'testing-library/prefer-screen-queries': 'off',
        },
    },

    // Dev-only files inside workspace packages resolve devDependencies from workspace root
    {
        files: ['packages/**/vite.config.ts', 'packages/**/*.test.ts', 'packages/**/{__testing__,testing,stories}/**/*.ts'],
        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: true,
                    peerDependencies: true,
                    packageDir: workspacePackageDirs,
                },
            ],
        },
    },

    // packages/shared/testing/src: explicit packageDir for import-x
    {
        files: ['packages/shared/testing/src/**/*.ts'],
        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                { devDependencies: ['**/storybook-helpers/**/*.ts', '**/*.test.ts'], packageDir: ['packages/shared/testing'] },
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

    {
        files: ['packages/tools/storybook/scripts/**/*.js'],
        rules: {
            'import-x/extensions': 'off',
        },
    },

    // Storybook config files use explicit .ts/.js extensions (allowImportingTsExtensions)
    {
        files: ['packages/tools/storybook/src/.storybook/**/*'],
        rules: {
            'import-x/extensions': 'off',
        },
    },

    // Domain quality gates. Domains depend only on shared libraries,
    // never on another domain: affected-domain test selection relies on it. Inline ESLint comments are
    // disabled so a gate cannot be switched off from inside a domain; exceptions go through this file.
    {
        files: ['packages/domains/**/*.{ts,vue}'],
        linterOptions: {
            noInlineConfig: true,
        },
        plugins: {
            '@nx': nx,
        },
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: false,
                    depConstraints: [{ sourceTag: 'type:domain', onlyDependOnLibsWithTags: ['type:shared'] }],
                },
            ],
            'no-warning-comments': ['error', { terms: ['istanbul ignore', 'v8 ignore', 'c8 ignore'], location: 'start' }],
        },
    },

    // Decision-heavy code belongs in composables or domain/src, where unit coverage measures it, not in components.
    {
        files: ['packages/domains/*/vue/src/**/*.vue'],
        // Known exceptions, above the limit before it was introduced. Extract their logic, then remove them here.
        ignores: [
            'packages/domains/transactions/vue/src/TransactionDetails/components/PaymentDetails/PaymentDetailsProperties.vue',
            'packages/domains/disputes/vue/src/DisputeManagement/components/DisputeDataProperties.vue',
            'packages/domains/payByLink/vue/src/PaymentLinkCreation/components/Form/Summary/FormSummary.vue',
        ],
        rules: {
            complexity: ['error', 15],
        },
    },

    // domain/src stays framework-neutral: business rules are unit-tested there without Vue.
    {
        files: ['packages/domains/*/domain/src/**/*.ts'],
        // Known exception: the payment link schema types its translator with the Vue-layer `I18n` type.
        // Move that type to the framework-neutral core, then remove this entry.
        ignores: ['packages/domains/payByLink/domain/src/PaymentLinkCreation/schema{,.test}.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                'vue',
                                'vue-i18n',
                                '@integration-components/composables-vue',
                                '@integration-components/composables-vue/*',
                                '*.vue',
                                '**/vue',
                                '**/vue/**',
                            ],
                            message: 'domain/src must stay framework-neutral: move Vue-dependent code to vue/src.',
                        },
                    ],
                },
            ],
        },
    },
];
