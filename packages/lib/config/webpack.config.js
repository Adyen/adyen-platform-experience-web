const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FILENAME = 'adyen-fp-web';
const shouldUseSourceMap = true;

module.exports = {
    entry: {
        AdyenFP: path.join(__dirname, '../src/index.ts'),
    },
    output: {
        filename: `${FILENAME}.js`,
        path: path.join(__dirname, '../dist'),
        library: '[name]',
        libraryTarget: 'umd',
        publicPath: '',
    },
    context: path.resolve(__dirname, '../src'),
    resolve: {
        alias: {
            src: path.resolve(__dirname, '../src'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss'],
    },
    stats: { children: false },
    module: {
        rules: [
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "url" loader works just like "file" loader but it also embeds
                    // assets smaller than specified size as data URLs to avoid requests.
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                    {
                        test: [/\.js?$/, /\.jsx?$/, /\.ts?$/, /\.tsx?$/],
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
                        test: /\.scss$/,
                        exclude: /\.module.scss$/,
                        resolve: {
                            extensions: ['.scss'],
                            alias: { '~': path.join(__dirname, '../src/style/index') },
                        },
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                            },
                            {
                                loader: 'css-loader',
                                options: { sourceMap: shouldUseSourceMap },
                            },
                            {
                                loader: 'sass-loader',
                                options: { sourceMap: shouldUseSourceMap },
                            },
                        ],
                    },
                    {
                        test: /\.module.scss$/,
                        resolve: { extensions: ['.scss'] },
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                            },
                            {
                                loader: 'css-loader',
                                options: { modules: true },
                            },
                            {
                                loader: 'sass-loader',
                            },
                        ],
                    },
                ],
            },
        ],
    },
};
