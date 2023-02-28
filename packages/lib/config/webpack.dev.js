const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpackConfig = require('./webpack.config');
const currentVersion = require('./version')();
const FILENAME = 'adyen-fp-web';

module.exports = merge(webpackConfig, {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                VERSION: JSON.stringify(currentVersion.ADYEN_FP_VERSION),
                COMMIT_HASH: JSON.stringify(currentVersion.COMMIT_HASH),
                COMMIT_BRANCH: JSON.stringify(currentVersion.COMMIT_BRANCH),
            },
        }),
        new MiniCssExtractPlugin({
            filename: `${FILENAME}.css`,
        }),
    ],
    optimization: {
        moduleIds: 'named',
        emitOnErrors: false,
        providedExports: true,
        usedExports: true,
        removeEmptyChunks: false, // Skip optimization for performance
        removeAvailableModules: false, // Skip optimization for performance
    },
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebook/create-react-app/issues/293
    // src/node_modules is not ignored to support absolute imports
    // https://github.com/facebook/create-react-app/issues/1065
    watchOptions: {
        // ignore: /node_modules/,
        aggregateTimeout: 200,
        poll: 500,
    },
});
