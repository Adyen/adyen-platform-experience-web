const { MOCKED_LEGAL_ENTITIES } = require('@adyen/adyen-fp-web-mocks');

module.exports = (req, res) => {
    const matchingMock = MOCKED_LEGAL_ENTITIES.find(mock => mock.id === req.params.id);

    if (!matchingMock) {
        res.status(404).send('Cannot find matching LE mock');
        return;
    }

    res.json(matchingMock);
};
