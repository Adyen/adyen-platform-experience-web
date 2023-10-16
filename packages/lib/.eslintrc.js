module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['react', '@typescript-eslint', 'import', 'jsx-a11y'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended' /*'prettier/@typescript-eslint'*/,
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true,
            jsx: true,
        },
    },
    env: {
        browser: true,
        node: true,
        es2020: true,
    },
    settings: {
        react: {
            version: '17.0',
        },
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
            typescript: {
                project: './tsconfig.json',
            },
        },
    },
    rules: {
        'no-console': 0,
        'class-methods-use-this': 'off', // TODO
        'no-underscore-dangle': 'off', // TODO
        'import/prefer-default-export': 'off',
        'no-debugger': 'warn',
        indent: 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    'config/playwright.config.ts',
                    'config/vite.config.ts',
                    '**/*.test.{ts,tsx}',
                    'config/**/*.ts',
                    'envs/**/*.ts',
                    'mocks/**/*.ts',
                    'tests/**/*.{ts,js}',
                    'src/utils/testing/**/*.{ts,tsx}',
                ],
                includeTypes: false,
            },
        ],
        'max-len': [
            'error',
            {
                code: 150,
                tabWidth: 2,
                ignoreComments: true, // Allow long comments in the code
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            },
        ],
        'prefer-destructuring': 'off',
        'arrow-parens': ['error', 'as-needed'],
        // Do not care about dangling comma presence
        'comma-dangle': 'off',
        // // Do not care about operators linebreak
        'operator-linebreak': 'off',
        // // Do not care about arrow function linebreak
        'implicit-arrow-linebreak': 'off',
        // // Do not care about empty lines about props
        'lines-between-class-members': 'off',
        // This is not important rule
        'object-curly-newline': 'off',
        // // Styling rule which doesn't add anything
        'no-multiple-empty-lines': 'off',
        // This rule doesn't make sense in the latest browsers
        radix: 'off',
        // This serves no practical purpose
        'eol-last': 'off',

        // the base rule can report incorrect errors
        'no-useless-constructor': 'off',

        // Typescript Rules
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, vars: 'local' }],
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
        '@typescript-eslint/ban-types': 'off', // TODO

        // React Rules
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'react/jsx-no-literals': 'error',

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
    overrides: [
        {
            // enable the rule specifically for TypeScript files
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'off', overrides: { properties: 'explicit' } }],
            },
        },
    ],
};
