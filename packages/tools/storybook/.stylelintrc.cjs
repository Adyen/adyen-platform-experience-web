module.exports = {
    extends: '../../../.stylelintrc.cjs',
    rules: {
        // Relax BEM naming for storybook classes, mixins, and variables
        'selector-class-pattern': null,
        'scss/at-mixin-pattern': null,
        'scss/dollar-variable-pattern': null,
    },
};
