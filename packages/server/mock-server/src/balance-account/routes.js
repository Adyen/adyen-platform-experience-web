import Router from 'express';
import { BALANCE_ACCOUNTS } from '../../../../../mocks/index.js';

const router = Router();

router.get('/:id', (req, res) => {
    const matchingMock = BALANCE_ACCOUNTS.find(mock => mock.id === req.params.id);
    if (!matchingMock) {
        res.status(404).send('Cannot find matching Balance Account mock');
        return;
    }

    res.json(matchingMock);
});

export default router;
