const getMySessionToken = async () => {
    // Here the merchant will call its own backend and their backend will call our backend
    // at the end this method should return a data formed as { id: string, token:string }
    const loadingContext = process.env.VITE_LOADING_CONTEXT;
    const normalizedLoadingContext = loadingContext.endsWith('/') ? loadingContext : `${loadingContext}/`;
    const url = new URL(`${normalizedLoadingContext}authe/api/v1/sessions`);
    const body = {
        allowOrigin: 'http://localhost',
        reference: 'platfrom-operations',
        product: 'platform',
        policy: {
            resources: [],
            roles: ['Transfers List Component - Read'],
        },
    };

    const response = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
    return await response.json();
};

export default getMySessionToken;
