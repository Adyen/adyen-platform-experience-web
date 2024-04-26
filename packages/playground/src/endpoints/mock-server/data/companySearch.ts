import type {
    CompanyDatasetResponse,
    CompanySearchResponse,
    CompanySearchResult,
    TinVerificationResponse,
} from '../../src/core/models/api/company-search';

const requestTime = new Date();

export const mockIndexSearchNoResultResponse: CompanySearchResponse = {
    results: [],
};

export const mockDeepSearchNoResultResponse: CompanySearchResponse = {
    results: [],
};

export const allIndexSearchResults: CompanySearchResult[] = [
    {
        id: 'B0EFD4C028DCCAA3026CA507510EE115',
        lastUpdate: '2023-02-12T03:55:36-07:00',
        name: 'Exact Match, Inc.',
        registrationNumber: '0866954 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: 'AA302B0028DCC6EFD4C10EE11CA50755',
        lastUpdate: '2021-06-21T04:58:38-05:00',
        name: 'APPLE HILL GROWERS',
        registrationNumber: '0586469 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: '6ABE3BE84A57BEFF3BA064967F3BFE8E',
        lastUpdate: '2018-06-21T04:58:38-05:00',
        name: 'APPLE VALLEY CHURCH OF TRUTH',
        registrationNumber: '0432600 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: '1FEEFEA886DA39EE5C2DEA5AF9472894',
        lastUpdate: '2019-06-21T04:58:38-05:00',
        name: 'APPLE VALLEY-VICTORVILLE JAYCEES',
        registrationNumber: '0400674 CA',
        requestTime: requestTime.toString(),
    },
];

export const allDeepSearchResults: CompanySearchResult[] = [
    {
        id: 'B0EFD4C028DCCAA3026CA507510EE115',
        lastUpdate: '2023-02-12T03:55:36-07:00',
        name: 'Exact Match, Inc.',
        registrationNumber: '0866954 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: 'AA302B0028DCC6EFD4C10EE11CA50755',
        lastUpdate: '2021-06-21T04:58:38-05:00',
        name: 'APPLE HILL GROWERS',
        registrationNumber: '0586469 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: '6ABE3BE84A57BEFF3BA064967F3BFE8E',
        lastUpdate: '2018-06-21T04:58:38-05:00',
        name: 'Apple, Inc',
        registrationNumber: '0432600 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: '7A333BE84A57BEFF3BADE1967F3B4321',
        lastUpdate: '2022-06-22T04:58:38-05:00',
        name: 'Apple company',
        registrationNumber: '0333600 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: '3BE86ABE4A57BEFF3BA06496FE8E7F3B',
        lastUpdate: '2021-11-21T04:58:38-05:00',
        name: 'APPLE VALLEY CHURCH OF TRUTH',
        registrationNumber: '0260430 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: '1FEEFEA886DA39EE5C2DEA5AF9472894',
        lastUpdate: '2019-06-21T04:58:38-05:00',
        name: 'APPLE VALLEY-VICTORVILLE JAYCEES',
        registrationNumber: '0400674 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: '6EFDAA3028DCC40755C10EE11CA502B0',
        lastUpdate: '2019-03-11T04:52:38-05:00',
        name: 'Zoro tools, LLC.',
        registrationNumber: '0866954 CA',
        requestTime: requestTime.toString(),
    },
    {
        id: 'BE867F3BFE4BE6ABE3FF3BA06A57498E',
        lastUpdate: '2022-02-11T02:52:38-01:00',
        name: 'Zoro & sons, Inc.',
        registrationNumber: '0260430 CA',
        requestTime: requestTime.toString(),
    },
];

export const createGetCompanyDataSetResponse = (searchResult: CompanySearchResult): CompanyDatasetResponse => ({
    address: `123 FAKE ST LOS ANGELES CA 90001`,
    country: 'US',
    id: searchResult.id,
    lastUpdate: searchResult.lastUpdate,
    name: searchResult.name,
    organizationType: 'BUSINESS',
    registrationNumber: searchResult.registrationNumber,
    requestTime: searchResult.requestTime,
});

export const mockValidTinVerificationResponse: TinVerificationResponse = {
    matched: true,
};

export const mockInvalidTinVerificationResponse: TinVerificationResponse = {
    matched: false,
};
