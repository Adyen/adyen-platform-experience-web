import { rest } from 'msw';

import auStates from './data/au-states.json';
import caStates from './data/ca-states.json';
import countries from './data/countries.json';
import nzStates from './data/nz-states.json';
import phonePrefixes from './data/phone-prefixes.json';
import usStates from './data/us-states.json';

const PREFIX = '/datasets';

export const datasetsMocks = [
    rest.get(`${PREFIX}/countries/:locale`, (req, res, ctx) => res(ctx.json(countries))),

    rest.get(`${PREFIX}/states/:country/:locale`, (req, res, ctx) => {
        let dataset: any;
        switch (req.params.country) {
            case 'AU':
                dataset = auStates;
                break;
            case 'CA':
                dataset = caStates;
                break;
            case 'NZ':
                dataset = nzStates;
                break;
            case 'US':
                dataset = usStates;
                break;
            default:
                throw new Error(`No states mock for "${req.params.country}", locale "${req.params.locale}"`);
        }

        return res(ctx.json(dataset));
    }),
];
