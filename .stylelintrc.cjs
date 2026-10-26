const bemPattern = '^.[adyen|fp]*(?:-[a-zA-Z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:\\[.+\\])?$';
const cssModulePattern = '^(?:b-[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*|[a-z][a-zA-Z0-9]*)(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?$';

module.exports = {
    extends: ['stylelint-config-recommended', 'stylelint-config-sass-guidelines'],
    plugins: ['stylelint-scss', 'stylelint-order'],
    ignoreFiles: ['netlify/edge-functions/proxy-requests.ts', 'src/style/bento/**/*.scss'],
    rules: {
        '@stylistic/indentation': 4,
        '@stylistic/max-empty-lines': 3,
        'max-nesting-depth': 3,
        'no-descending-specificity': true,
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
        'selector-no-vendor-prefix': true,

        // Replaced CSS with SCSS rules
        'at-rule-no-unknown': null,

        // stylelint-scss plugin
        'scss/at-rule-no-unknown': true,

        // stylelint-order plugin
        'order/properties-alphabetical-order': true,

        // BEM naming
        'selector-class-pattern': [bemPattern, { resolveNestedSelectors: true }],
        'scss/at-mixin-pattern': bemPattern,
        'scss/dollar-variable-pattern': bemPattern,

        // Vendor prefixes are hand-written: autoprefixer is not part of the build pipeline
        'property-no-vendor-prefix': null,

        // Forbid file extensions in @import paths (extensions are matched without the leading dot)
        'scss/at-import-partial-extension-disallowed-list': ['scss'],
    },
    overrides: [
        {
            files: ['packages/**/*.module.scss'],
            rules: {
                'selector-class-pattern': cssModulePattern,
            },
        },
        {
            // Relax BEM naming for storybook classes, mixins, and variables
            files: ['packages/tools/storybook/**/*.scss'],
            rules: {
                'selector-class-pattern': null,
                'scss/at-mixin-pattern': null,
                'scss/dollar-variable-pattern': null,
            },
        },
    ],
};
