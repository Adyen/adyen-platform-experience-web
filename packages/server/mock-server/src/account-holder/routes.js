import Router from 'express';
import { ACCOUNT_HOLDERS } from '../../../../../mocks/index.js';

const router = Router();

router.get('/:id', (req, res) => {
    const matchingMock = ACCOUNT_HOLDERS.find(mock => mock.id === req.params.id);
    if (!matchingMock) {
        res.status(404).send('Cannot find matching Account Holder mock');
        return;
    }

    res.json(matchingMock);
});

export default router;
