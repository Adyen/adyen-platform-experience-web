const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config');
const devServer = require('@pabloai/adyen-fp-server');
const { htmlPages, playgroundEntry } = require('./playground-pages');
const path = require('path');
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3030;

module.exports = merge(baseConfig, {
    mode: 'development',
    plugins: [
        ...htmlPages,
        new webpack.DefinePlugin({
            'process.env': {
                __CLIENT_KEY__: JSON.stringify(process.env.CLIENT_KEY || null),
                __CLIENT_ENV__: JSON.stringify(process.env.CLIENT_ENV || 'test'),
            },
        }),
    ],
    devtool: 'cheap-module-source-map',
    entry: playgroundEntry,
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     enforce: 'pre',
            //     use: ['source-map-loader'],
            // },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    {
                        test: [/\.js?$/],
                        include: [path.resolve(__dirname, '../src')],
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: 'ts-loader',
                                options: { configFile: path.resolve(__dirname, '../tsconfig.json') },
                            },
                        ],
                    },
                    {
                        test: [/\.scss$/, /\.css$/],
                        resolve: { extensions: ['.scss', '.css'] },
                        use: [
                            {
                                loader: 'style-loader',
                            },
                            {
                                loader: 'css-loader',
                            },
                            {
                                loader: 'sass-loader',
                            },
                        ],
                    },
                    {
                        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: '[name].[ext]',
                                    outputPath: 'fonts/',
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    devServer: {
        onAfterSetupMiddleware: ({ app }) => devServer(app),
        hot: true,
        https: false,
        port,
        host,
        compress: false,
        watchFiles: {
            options: { usePolling: true }
        },
    },
});
