import Router from 'express';
import { BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT } from '../../../../../mocks/index.js';

const router = Router();

router.get('/', (req, res) => {
    res.json({ data: BASIC_TRANSACTIONS_LIST });
});
router.get('/:id', (req, res) => {
    const matchingMock = [...BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT].find(mock => mock.id === req.params.id);

    if (!matchingMock) {
        res.status(404).send('Cannot find matching LE mock');
        return;
    }

    res.json(matchingMock);
});

export default router;
