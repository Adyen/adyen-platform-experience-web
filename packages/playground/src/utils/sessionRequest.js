const getMySessionToken = async () => {
    // Here the merchant will call its own backend and their backend will call our backend
    // at the end this method should return a data formed as { id: string, token:string }
    const loadingContext = process.env.VITE_LOADING_CONTEXT;
    const normalizedLoadingContext = loadingContext.endsWith('/') ? loadingContext : `${loadingContext}/`;
    const url = new URL(`${normalizedLoadingContext}authe/api/v1/sessions`);
    const body = {
        allowOrigin: process.env.VITE_LOADING_CONTEXT?.endsWith('/') ? process.env.VITE_LOADING_CONTEXT.slice(0, -1) : process.env.undefined,
        reference: 'platform-operations',
        product: 'platform',
        policy: {
            resources: [
                {
                    type: 'accountHolder',
                    accountHolderId: process.env.SESSION_ACCOUNT_HOLDER,
                },
            ],
            roles: ['Transactions Overview Component – View'],
        },
    };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return await response.json();
};

export default getMySessionToken;
