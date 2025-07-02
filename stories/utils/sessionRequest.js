const getMySessionToken = async session => {
    // Here the merchant will call its own backend and their backend will call our backend
    // at the end this method should return a data formed as { id: string, token:string }
    const loadingContext = process.env.VITE_PLAYGROUND_URL;
    const normalizedLoadingContext = loadingContext?.endsWith('/') ? loadingContext : `${loadingContext ?? ''}/`;
    const url = new URL(`${normalizedLoadingContext}api/authe/api/v1/sessions`);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            allowOrigin: loadingContext?.endsWith('/') ? loadingContext.slice(0, -1) : loadingContext,
            policy: {
                resources: [
                    {
                        type: 'accountHolder',
                        accountHolderId: session?.accountHolderId || process.env.SESSION_ACCOUNT_HOLDER,
                    },
                ],
                roles: [
                    'Capital Component: Manage',
                    'Disputes Component: Manage',
                    'Payouts Overview Component: View',
                    'Reports Overview Component: View',
                    'Transactions Overview Component: Manage Refunds',
                    'Transactions Overview Component: View',
                    ...(session?.roles?.length ? session.roles : []),
                ],
            },
            product: 'platform',
        }),
    });

    return await response.json();
};

export default getMySessionToken;
