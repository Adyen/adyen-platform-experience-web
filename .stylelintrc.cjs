const bemPattern = '^.[adyen|fp]*(?:-[a-zA-Z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:\\[.+\\])?$';

module.exports = {
    extends: ['stylelint-config-recommended', 'stylelint-config-sass-guidelines'],
    plugins: ['stylelint-scss'],
    ignoreFiles: [
        'netlify/edge-functions/proxy-requests.ts',
        'src/style/bento/**/*.scss',
    ],
    rules: {
        '@stylistic/indentation': 4,
        '@stylistic/max-empty-lines': 3,
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

        'scss/at-import-partial-extension-disallowed-list': null,

        // TODO: Enable new rules in stylelint v17 / sass-guidelines v13
        'selector-no-qualifying-type': null,
        'media-query-no-invalid': null,
        'declaration-property-value-no-unknown': null,
        'declaration-property-value-keyword-no-deprecated': null,
        'property-no-deprecated': null,
        'scss/no-global-function-names': null,
        'nesting-selector-no-missing-scoping-root': null,
    },
};
