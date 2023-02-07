module.exports = {
    resolve: {
        mainFields: ['module', 'main'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss'],

        // Some libraries import Node modules but don't use them in the browser.
        // Tell Webpack to provide empty mocks for them so importing them works.
        fallback: {
            dgram: false,
            fs: false,
            net: false,
            tls: false,
            child_process: false,
        }
    },
    stats: { children: false },
};
