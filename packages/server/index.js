const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });
const getTransactions = require('./api/transactions');
const getTransactionById = require('./api/transactions-id');
const getBalanceAccountById = require('./api/balance-account-id');
const getAccountHoldersById = require('./api/account-holders-id');
const getAccountHolders = require('./api/account-holders');
const express = require('express');

const defaultPort = 3030;

module.exports = (app = express(), options = []) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((_, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.get('/transactions', getTransactions);

    app.get('/transactions/:id', getTransactionById);

    app.get('/balanceAccounts/:id', getBalanceAccountById);

    app.get('/accountHolders/:id', getAccountHoldersById);

    app.get('/accountHolders', getAccountHolders);

    if (options.listen) {
        const port = process.env.PORT || defaultPort;
        app.listen(port, () => console.log(`Listening on localhost:${port}`));
    }

    return app;
};
