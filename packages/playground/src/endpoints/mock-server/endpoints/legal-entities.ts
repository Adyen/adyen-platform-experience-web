import { rest } from 'msw';
import { MOCKED_LEGAL_ENTITIES } from '../../../../../../mocks/src/legalEntity';

const PREFIX = '/legalEntities';

export const legalEntitiesMocks = [
    rest.get(`${PREFIX}/:id`, (req, res, ctx) => {
        const matchingMock = MOCKED_LEGAL_ENTITIES.find(mock => mock.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching LE mock'));
            return;
        }
        return res(ctx.json(matchingMock));
    }),
];
