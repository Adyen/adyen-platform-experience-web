import { rest } from 'msw';

import {
    MOCK_CONFIGURATION_COMPANY_L,
    MOCK_CONFIGURATION_COMPANY_L_REG_DOC,
    MOCK_CONFIGURATION_COMPANY_L1,
    MOCK_CONFIGURATION_COMPANY_L1_HU,
    MOCK_CONFIGURATION_INDIVIDUAL_NL,
    MOCK_CONFIGURATION_INDIVIDUAL_US,
    MOCK_CONFIGURATION_SOLEPROPRIETORSHIP_L,
    MOCK_CONFIGURATION_TRUST_L,
    NOT_AUTHORIZED,
    supportedCountries,
    supportedLocales,
} from './data/configuration';

const getConfigurationMock = (legalEntityType: any, country: any, capabilities: string[] | undefined): any => {
    switch (legalEntityType) {
        case 'organization':
            switch (country) {
                case 'HU':
                    return MOCK_CONFIGURATION_COMPANY_L1_HU;
                case 'CA':
                    return capabilities?.includes('issueCard') || capabilities?.includes('receiveFromTransferInstrument')
                        ? MOCK_CONFIGURATION_COMPANY_L_REG_DOC
                        : MOCK_CONFIGURATION_COMPANY_L1;
                case 'US':
                case 'NL':
                case 'AU':
                case 'SG':
                    return MOCK_CONFIGURATION_COMPANY_L;
                default:
                    return capabilities?.includes('issueCard') ? MOCK_CONFIGURATION_COMPANY_L : MOCK_CONFIGURATION_COMPANY_L1;
            }

        case 'trust':
            return MOCK_CONFIGURATION_TRUST_L;
        case 'soleProprietorship':
            return MOCK_CONFIGURATION_SOLEPROPRIETORSHIP_L;

        case 'individual':
        default:
            switch (country) {
                case 'US':
                    return MOCK_CONFIGURATION_INDIVIDUAL_US;
                case 'NL':
                default:
                    return MOCK_CONFIGURATION_INDIVIDUAL_NL;
            }
    }
};

const PREFIX = '/v1/configuration';

export const configurationMocks = [
    rest.post(PREFIX, async (req, res, ctx) => {
        if (req.url.searchParams.get('clientKey')) {
            const { legalEntityType, country, capabilities } = await req.json<any>();
            const configurationMock = getConfigurationMock(legalEntityType, country, capabilities);

            return res(ctx.json(configurationMock));
        }
        return res(ctx.status(401), ctx.json(NOT_AUTHORIZED));
    }),

    rest.get(`${PREFIX}/locales`, (req, res, ctx) => res(ctx.json(supportedLocales))),

    rest.get(`${PREFIX}/countries`, (req, res, ctx) => res(ctx.json(supportedCountries))),
];
