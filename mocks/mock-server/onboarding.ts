import { http, HttpResponse } from 'msw';
import {
    ANALYTICS,
    LEGAL_ENTITY,
    TERMS_OF_SERVICE,
    TERMS_OF_SERVICE_ACCEPTANCE_INFOS,
    TERMS_OF_SERVICE_STATUS,
    VERSION,
    LEGAL_FORMS,
    NACE_CODES,
    TERMS_OF_SERVICE_ACCEPTANCE,
    TERMS_OF_SERVICE_DOCUMENT_ACCEPTED,
    TERMS_OF_SERVICE_STATUS_EMPTY,
    TERMS_OF_SERVICE_ACCEPTANCE_INFOS_EMPTY,
} from '../mock-data/onboarding';

const baseUrl = 'https://test.adyen.com/onboardingcomponents/api/v1';

let areTermsOfServiceSigned = false;

export const onboardingMocks = [
    http.post(`${baseUrl}/analytics/ui`, () => {
        return HttpResponse.json(ANALYTICS);
    }),
    http.post(`${baseUrl}/analytics/ui/:id`, () => {
        return new HttpResponse(null, { status: 204 });
    }),
    http.get(`${baseUrl}/datasets/legalForms/NL`, () => {
        return HttpResponse.json(LEGAL_FORMS);
    }),
    http.get(`${baseUrl}/datasets/naceCodes`, () => {
        return HttpResponse.json(NACE_CODES);
    }),
    http.all(`${baseUrl}/legalEntities/:id`, async () => {
        return HttpResponse.json(LEGAL_ENTITY);
    }),
    http.get(`${baseUrl}/legalEntities/:id/configurations/version`, () => {
        return HttpResponse.json(VERSION);
    }),
    http.get(`${baseUrl}/legalEntities/:id/configurations/supportedCountries`, () => {
        return HttpResponse.json({
            countries: [
                'DE',
                'NO',
                'PR',
                'BE',
                'FI',
                'HK',
                'PT',
                'BG',
                'DK',
                'LT',
                'LU',
                'HR',
                'LV',
                'FR',
                'NZ',
                'HU',
                'SE',
                'SG',
                'MC',
                'SI',
                'SK',
                'GB',
                'IE',
                'CA',
                'US',
                'EE',
                'GG',
                'GI',
                'IM',
                'CH',
                'MT',
                'GR',
                'IT',
                'ES',
                'AT',
                'AU',
                'CY',
                'CZ',
                'JE',
                'PL',
                'LI',
                'RO',
                'NL',
            ],
        });
    }),
    http.post(`${baseUrl}/legalEntities/:id/termsOfService`, () => {
        return HttpResponse.json(TERMS_OF_SERVICE);
    }),
    http.post(`${baseUrl}/legalEntities/:id/termsOfService/accept`, () => {
        areTermsOfServiceSigned = true;
        return HttpResponse.json(TERMS_OF_SERVICE_ACCEPTANCE);
    }),
    http.get(`${baseUrl}/legalEntities/:id/termsOfService/acceptedTermsOfServiceDocument/:id`, () => {
        return HttpResponse.json(TERMS_OF_SERVICE_DOCUMENT_ACCEPTED);
    }),
    http.get(`${baseUrl}/legalEntities/:id/termsOfService/termsOfServiceStatus`, () => {
        return HttpResponse.json(areTermsOfServiceSigned ? TERMS_OF_SERVICE_STATUS_EMPTY : TERMS_OF_SERVICE_STATUS);
    }),
    http.get(`${baseUrl}/legalEntities/:id/termsOfService/termsOfServiceAcceptanceInfos`, () => {
        return HttpResponse.json(areTermsOfServiceSigned ? TERMS_OF_SERVICE_ACCEPTANCE_INFOS : TERMS_OF_SERVICE_ACCEPTANCE_INFOS_EMPTY);
    }),
];
