const getTransactions = require('./get-transactions');
const getTransactionById = require('./get-transactions-id');
const { Router } = require('express');

const router = Router();

router.use('/', getTransactions);
router.use('/:id', getTransactionById);

module.exports = router;
