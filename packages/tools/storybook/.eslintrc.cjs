module.exports = {
    extends: '../../../.eslintrc.cjs',
    rules: {
        'import-x/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
                peerDependencies: true,
                packageDir: ['./', '../../../'],
            },
        ],
    },
};
