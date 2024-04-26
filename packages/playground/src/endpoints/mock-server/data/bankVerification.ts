export const getBankVerificationVendorsUrlMock_Tink = (referer: URL) => {
    const searchParams = new URLSearchParams();
    searchParams.set('redirect_uri', `${referer.origin}/bankVerificationVendors/accountVerificationReport/tink`);

    return [
        {
            name: 'Tink',
            redirectUrl: `${referer.origin}/tinkEmbed/?${searchParams}`,
        },
    ];
};

export const getBankVerificationVendorsUrlMock_Trustly = (referer: URL) => [
    {
        name: 'PayWithMyBank',
        redirectUrl: `${referer.origin}/trustlyEmbed/`,
    },
];
