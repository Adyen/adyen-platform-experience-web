const getMySessionToken = async session => {
    // Here the merchant will call its own backend and their backend will call our backend
    // at the end this method should return a data formed as { id: string, token:string }
    const url = process.env.VITE_APP_URL;
    const allowOrigin = url?.endsWith('/') ? url.slice(0, -1) : url;
    const normalizedUrl = url?.endsWith('/') ? url : `${url ?? ''}/`;
    const sessionUrl = new URL(`${normalizedUrl}api/authe/api/v1/sessions`);

    const response = await fetch(sessionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            allowOrigin,
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
                    'Pay By Link Component: View',
                    'Pay By Link Component: Manage Links',
                    'Pay By Link Component: Manage Settings',
                    ...(session?.roles?.length ? session.roles : []),
                ],
            },
            product: 'platform',
        }),
    });

    return await response.json();
};

export default getMySessionToken;
