import { Router } from 'express';
import getAccountHolderById from './get-account-holders-id';

const router = Router();

router.use('/:id', getAccountHolderById);

export default router;
