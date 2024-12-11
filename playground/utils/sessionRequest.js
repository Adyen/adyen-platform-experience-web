const getMySessionToken = async session => {
    // Here the merchant will call its own backend and their backend will call our backend
    // at the end this method should return a data formed as { id: string, token:string }
    const loadingContext = process.env.VITE_PLAYGROUND_URL;
    const normalizedLoadingContext = loadingContext.endsWith('/') ? loadingContext : `${loadingContext}/`;
    const url = new URL(`${normalizedLoadingContext}api/authe/api/v1/sessions`);
    const body = {
        allowOrigin: process.env.VITE_PLAYGROUND_URL?.endsWith('/') ? process.env.VITE_PLAYGROUND_URL.slice(0, -1) : process.env.VITE_PLAYGROUND_URL,
        reference: 'platform-operations',
        product: 'platform',
        policy: {
            resources: [
                {
                    type: 'accountHolder',
                    accountHolderId: session?.accountHolderId || process.env.SESSION_ACCOUNT_HOLDER,
                },
            ],
            roles: [
                'Transactions Overview Component: Manage Refunds',
                'Transactions Overview Component: View',
                'Payouts Overview Component: View',
                'Reports Overview Component: View',
                'Capital Component: Manage',
                ...(session?.roles?.length ? session.roles : []),
            ],
        },
    };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    return await response.json();
};

export default getMySessionToken;
