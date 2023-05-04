const { Router } = require('express');
const getBalanceAccountById = require('./get-balance-account-id');

const router = Router();

router.use('/:id', getBalanceAccountById);

module.exports = router;
