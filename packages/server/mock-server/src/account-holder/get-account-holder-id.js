import { MOCKED_LEGAL_ENTITIES } from '../../../../../mocks/index';

export default function (req, res) {
    const matchingMock = MOCKED_LEGAL_ENTITIES.find(mock => mock.id === req.params.id);
    console.log('MOCKED_LEGAL_ENTITIESs', MOCKED_LEGAL_ENTITIES);
    if (!matchingMock) {
        res.status(404).send('Cannot find matching LE mock');
        return;
    }

    res.json(matchingMock);
}
