const bemPattern = '^.[adyen|fp]*(?:-[a-zA-Z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:\\[.+\\])?$';

module.exports = {
    syntax: 'scss',
    extends: ['stylelint-config-recommended', 'stylelint-config-sass-guidelines'],
    plugins: ['stylelint-scss'],
    ignoreFiles: ['packages/playground/src/**/*.scss'],
    rules: {
        indentation: [4, { indentClosingBrace: false }],
        'max-empty-lines': 3,
        'max-nesting-depth': 3,
        'no-descending-specificity': null,
        'property-no-vendor-prefix': null,
        'selector-no-vendor-prefix': null,

        // Replaced CSS with SCSS rules
        'at-rule-no-unknown': null,

        // stylelint-scss plugin
        'scss/at-rule-no-unknown': true,

        // BEM naming
        'selector-class-pattern': [bemPattern, { resolveNestedSelectors: true }],
        'scss/at-mixin-pattern': bemPattern,
        'scss/dollar-variable-pattern': bemPattern,

        'scss/at-import-partial-extension-blacklist': null,
    },
};
