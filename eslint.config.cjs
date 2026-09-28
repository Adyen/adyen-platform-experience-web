'use strict';

const { existsSync, readdirSync } = require('node:fs');
const { join, relative } = require('node:path');
const js = require('@eslint/js');
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
        linterOptions: {
            // Stale disable comments fail lint instead of silently accumulating as warnings
            reportUnusedDisableDirectives: 'error',
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
                        'packages/**/vite.config.ts',
                        '**/*.test.ts',
                        '{config,endpoints,envs,mocks,scripts,src}/**/*.ts',
                        '{src,packages}/**/{__testing__,testing}/**/*.ts',
                        'packages/domains/*/{domain,vue}/tests/**/*.ts',
                        'packages/domains/*/**/stories/**/*.ts',
                        'packages/domains/*/{fixtures,mocks}/**/*.ts',
                        'packages/sdk/tests/**/*.ts',
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
            // Prettier owns template content layout; these stylistic rules fight it
            'vue/singleline-html-element-content-newline': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            // Semantic template rules: enforce as errors
            'vue/attributes-order': 'error',
            // Enforce kebab-case attributes, but ignore camelCase props bound to embedded web components:
            // their .prop DOM property names must match the web component's API exactly
            'vue/attribute-hyphenation': ['error', 'always', { ignore: ['fetchToken'] }],
        },
    },

    // Test files commonly define multiple small inline components per file
    {
        files: ['**/*.{test,spec}.ts'],
        rules: {
            'vue/one-component-per-file': 'off',
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

    // Root CommonJS tooling files use require() and dev-only dependencies
    {
        files: ['*.cjs', '.pnpmfile.cjs', 'config/**/*.cjs', 'scripts/**/*.cjs', '.changeset/**/*.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            'import-x/no-extraneous-dependencies': ['error', { devDependencies: true, peerDependencies: true }],
        },
    },

    // Root config files import with explicit .ts extensions (allowImportingTsExtensions)
    {
        files: ['config/**/*.ts'],
        rules: {
            'import-x/extensions': 'off',
        },
    },

    // Netlify edge functions need explicit extensions (Deno-style resolution)
    {
        files: ['netlify/edge-functions/**'],
        rules: {
            'import-x/extensions': ['error', 'always'],
        },
    },

    // Naming conventions: value identifiers are camelCase (or UPPER_CASE constants), types and classes are PascalCase
    {
        files: ['**/*.{js,mjs,cjs,ts,vue}'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                // Locale-coded translation identifiers (e.g. da_DK, pt_BR, _en_US) are allowed to mirror IETF locale tags
                { selector: 'variable', filter: { regex: '^_?[a-z]{2}_[A-Z]{2}$', match: true }, format: null },
                // Dunder sentinel identifiers (e.g. __INDEXED_PROTO__) are allowed
                { selector: 'variable', filter: { regex: '^__\\w+__$', match: true }, format: null },
                // Imported names follow their source: helpers (camelCase), types/classes (PascalCase), constants (UPPER_CASE)
                { selector: 'import', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
                // Value identifiers: camelCase; const-bound values may also be UPPER_CASE constants or PascalCase (components, class references); leading underscore marks module-private values
                { selector: 'variable', modifiers: ['const'], format: ['camelCase', 'UPPER_CASE', 'PascalCase'], leadingUnderscore: 'allow' },
                // Re-assignable identifiers stay camelCase (UPPER_CASE retained for mutable test counters)
                { selector: 'variable', format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
                // PascalCase stays valid for component-like factories (e.g. AdyenPlatformExperience); leading underscore marks module-private functions
                { selector: 'function', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
                { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
                // Types, classes, interfaces and enums: PascalCase; leading underscore marks internal types
                { selector: 'typeLike', format: ['PascalCase'], leadingUnderscore: 'allow' },
            ],
        },
    },

    // Generated API resource types are exempt (produced by schemas:generate, never hand-edited)
    {
        files: ['packages/shared/types/src/api/resources/**', 'src/types/api/**'],
        rules: {
            '@typescript-eslint/naming-convention': 'off',
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
                { devDependencies: ['**/storybook-helpers/**/*.ts'], packageDir: ['packages/shared/testing'] },
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
];
