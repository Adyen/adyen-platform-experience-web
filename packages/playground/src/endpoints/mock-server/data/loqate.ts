import { AddressSearchResponse, LoqateAddress } from '../../src/core/models/api/address-search';

export const searchForAddressMock: AddressSearchResponse = {
    results: [
        {
            description: '599 Addresses',
            highlight: '0-3',
            id: 'S3B-RixSZTBMMjlF',
            text: 'Simonshaven',
            type: 'Locality',
        },
        {
            description: '3523 Addresses',
            highlight: '0-3',
            id: 'S3B-ODhMfl9gcFx',
            text: 'Simpelveld',
            type: 'Locality',
        },
        {
            description: '2353LG Leiderdorp - 7 Addresses',
            highlight: '0-5',
            id: 'S3B-SGM33RVJyJFJjQSg4Om0nO0xxdmF7',
            text: 'Simon Vinkenoogstraat',
            type: 'Street',
        },
        {
            description: '7595NC Weerselo',
            highlight: '0-3',
            id: 'S3B-SlxoI25jIThgN',
            text: 'Simbroekweg',
            type: 'Address',
        },
        {
            description: '4357HJ Domburg',
            highlight: '0-3',
            id: 'S3B-SCI9OWhXVHEyaTJdVk5pUDBJKGQ33bkxdWg',
            text: 'Simniapad 1',
            type: 'Address',
        },
        {
            description: '5851DK Afferden',
            highlight: '14-16;7-15',
            id: 'S3B-VltITUtXOXoxKEY4TVR0d0xeIHNibCp0R2033Kn9FUTZuLyI7JQ',
            text: 'Leegveldseweg 12',
            type: 'Address',
        },
        {
            description: '5851AN Afferden',
            highlight: '21-23;7-15',
            id: 'S3B-Vmg32d1032blduemVqOzxgRS1LWDAlcn8hb21jfFVHPEhLblNAdA',
            text: 'Pastoor Berdenstraat 12',
            type: 'Address',
        },
        {
            description: '6654BX Afferden',
            highlight: '13-15;7-15',
            id: 'S3B-VlpvQzZ33ZmZgMUJmP0JsVm1GJHVdayZRMzUgfzdWcFB7a0wrcA',
            text: 'Koningsplein 12',
            type: 'Address',
        },
        {
            description: '5851EJ Afferden',
            highlight: '8-10;7-15',
            id: 'S3B-VlU33PWV0O28yVGVgTU9HczMsXn1vLzpkW32Fvais8UH5IOCx32Ig',
            text: 'Rimpelt 12',
            type: 'Address',
        },
        {
            description: '5851EA Afferden',
            highlight: '10-12;7-15',
            id: 'S3B-Vjo6IWN4VVIjYlkqNVQ9MHA9XUpAJm1SRXN1NzVOdzAxdy5ZbQ',
            text: 'Hengeland 12',
            type: 'Address',
        },
        {
            description: '5851AC Afferden',
            highlight: '10-12;7-15',
            id: 'S3B-VmJtJ25HPVFQN1pxSExxfEA4ciVYeCRkdVtRJkxkUUhobWREcQ',
            text: 'Spitsbrug 12',
            type: 'Address',
        },
        {
            description: '6654AJ Afferden',
            highlight: '16-18;7-15',
            id: 'S3B-Vmsra21lO32MyUDhIdVl1S2JIfzVWOWApP0JAMXRMOi832cWxjNg',
            text: 'Van Weliestraat 12',
            type: 'Address',
        },
        {
            description: '6654BR Afferden',
            highlight: '9-11;7-15',
            id: 'S3B-Vlw7TlIibFFNICcmW0AzaFY5Jn5Qa32w2OiZmM32dQaGl9cSRUZA',
            text: 'De Laren 12',
            type: 'Address',
        },
        {
            description: '5851GA Afferden',
            highlight: '11-13;7-15',
            id: 'S3B-VkNVOFFNIi5cbHlFSy5iVzgoMUY2TVdNQXdpKz8saUwiMCFYKw',
            text: 'Berkenkamp 12',
            type: 'Address',
        },
        {
            description: '6654AT Afferden',
            highlight: '8-10;7-15',
            id: 'S3B-Vn5IJShrVD8seDtfW32A32RjpgPCEwcnpeckYtfC5KIXdLXGRzRA',
            text: 'Kerkweg 12',
            type: 'Address',
        },
    ],
};

export const searchForKompanyAddressMock: AddressSearchResponse = {
    results: [
        {
            description: '90001 Los Angeles',
            highlight: '0-11',
            id: 'kompany',
            text: '123 Fake Street',
            type: 'Address',
        },
        {
            description: '90001 Los Angeles',
            highlight: '0-10',
            id: 'kompany1',
            text: '125 Fake Street',
            type: 'Address',
        },
        {
            description: '90001 Los Angeles',
            highlight: '0-11',
            id: 'kompany2',
            text: '123 Fake Lane',
            type: 'Address',
        },
        {
            description: '90001 Los Angeles',
            highlight: '0-11',
            id: 'kompany3',
            text: '123 Fake Ave',
            type: 'Address',
        },
    ],
};

export const searchForAddressDrilldownMock: AddressSearchResponse = {
    results: [
        {
            description: '3212LA Simonshaven',
            highlight: '',
            id: 'S3B-SG9WfWl33LmlCeUEzezpSYi89Uzxec0dWeQ',
            text: 'Beverwijkstraat 1',
            type: 'Address',
        },
        {
            description: '3212LX Simonshaven',
            highlight: '',
            id: 'S3B-SERGXFZNNC834Y321LRU8rNn8tNWQ7KHVCOg',
            text: 'Biertsedijk Oost 1',
            type: 'Address',
        },
        {
            description: '3212LG Simonshaven',
            highlight: '',
            id: 'S3B-SHlVQHApZ32Yydz534bk9nbnYsandkWiVQbA',
            text: 'Hogeweg 1',
            type: 'Address',
        },
        {
            description: '3212MB Simonshaven',
            highlight: '',
            id: 'S3B-SCtnUCtlUUF9PXdsXlIiX2FTSGZLOnEsXA',
            text: 'Kerkweg 1',
            type: 'Address',
        },
        {
            description: '3212LZ Simonshaven',
            highlight: '',
            id: 'S3B-SH8gPT5MV2JpaDkze2ohfEFDOD0xcjklKg',
            text: 'Lageweg 1',
            type: 'Address',
        },
    ],
};

export const retrieveAddressDetailsMock: LoqateAddress = {
    city: 'Simonshaven',
    country: 'NL',
    houseNumberOrName: '1',
    postalCode: '3212LA',
    stateOrProvince: 'ZH',
    street: 'Beverwijkstraat',
};

export const retrieveKompanyAddressDetailsMock: LoqateAddress = {
    city: 'Los Angeles',
    country: 'US',
    postalCode: '90001',
    stateOrProvince: 'CA',
    street: '123 Fake Street',
};
