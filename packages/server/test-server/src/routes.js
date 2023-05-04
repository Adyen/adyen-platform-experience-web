const { Router } = require('express');
const Transactions = require('./transactions/routes');
const BalanceAccounts = require('./balance-accounts/routes');
const AccountHolders = require('./account-holders/routes');
const LegalEntity = require('./legal-entity/routes');

const router = Router();

router.use('/transactions', Transactions);
router.use('/balanceAccounts', BalanceAccounts);
router.use('/accountHolders', AccountHolders);
router.use('/accountHolders', LegalEntity);

router.use((req, res) => {
    console.log(`${req.path} didn't match any available endpoint`);
    res.sendStatus(404);
});

module.exports = router;
