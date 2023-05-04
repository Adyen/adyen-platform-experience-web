const { Router } = require('express');
const getAccountHolderById = require('./get-account-holders-id');

const router = Router();

router.use('/:id', getAccountHolderById);

module.exports = router;
