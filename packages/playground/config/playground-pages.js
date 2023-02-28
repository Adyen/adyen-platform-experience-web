const HTMLWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('./utils');

// NOTE: The first page in the array will be used as the index page.
const pages = [
    { name: 'Transactions', id: 'Transactions' },
    { name: 'Transaction', id: 'Transaction' },
    { name: 'Balance account', id: 'BalanceAccount' },
    { name: 'Account holder', id: 'AccountHolder' },
    { name: 'Account holders', id: 'AccountHolders' },
];

const htmlPageGenerator = ({ id }, index) =>
    new HTMLWebpackPlugin({
        filename: `${index ? `${id.toLowerCase()}/` : ''}index.html`,
        template: resolve(`../../playground/src/pages/${id}/${id}.html`),
        templateParameters: () => ({ htmlWebpackPlugin: { htmlPages: pages } }),
        inject: 'body',
        chunks: [`AdyenDemo${id}`],
        chunksSortMode: 'manual'
    });

const htmlPages = pages.map(htmlPageGenerator);

const playgroundEntry = pages.reduce((acc, { id }) => {
    acc[`AdyenDemo${id}`] = resolve(`../../playground/src/pages/${id}/${id}.js`);
    return acc;
}, {});

module.exports = { htmlPages, playgroundEntry };
