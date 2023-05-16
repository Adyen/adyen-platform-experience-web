import Router from 'express';
import getLegalEntityById from './get-account-holder-id.js';

const router = Router();

router.use('/:id', getLegalEntityById);

export default router;
