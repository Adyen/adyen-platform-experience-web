import Router from 'express';
import getLegalEntityById from './get-legal-entity-id';

const router = Router();

router.use('/:id', getLegalEntityById);

export default router;
