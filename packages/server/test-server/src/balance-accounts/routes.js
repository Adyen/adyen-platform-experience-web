import { Router } from 'express';
import getBalanceAccountById from './get-balance-account-id';

const router = Router();

router.use('/:id', getBalanceAccountById);

export default router;
