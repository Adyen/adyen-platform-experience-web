import Router from 'express';
import { MOCKED_LEGAL_ENTITIES } from '../../../../../mocks/index.js';

const router = Router();

router.get('/:id', (req, res) => {
    const matchingMock = MOCKED_LEGAL_ENTITIES.find(mock => mock.id === req.params.id);

    if (!matchingMock) {
        res.status(404).send(JSON.stringify('Cannot find matching LE mock'));
        return;
    }

    res.json(matchingMock);
});

export default router;
