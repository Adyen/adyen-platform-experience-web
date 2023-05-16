import getTransactions from './get-transactions';
import getTransactionById from './get-transactions-id';
import { Router } from 'express';

const router = Router();

router.use('/', getTransactions);
router.use('/:id', getTransactionById);

export default router;
