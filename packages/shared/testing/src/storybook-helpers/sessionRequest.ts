interface SessionOptions {
    accountHolderId?: string;
    roles?: string[];
}

interface SessionResponse {
    id: string;
    token: string;
}

/**
 * Requests a session token from the local dev backend (via the proxy set up in .storybook/main.ts).
 * Mirrors the Preact Container helper; used by the Vue storybook Container to bootstrap Core.
 */
export const getMySessionToken = async (session?: SessionOptions): Promise<SessionResponse> => {
    const url = process.env.VITE_APP_URL;
    const allowOrigin = url?.endsWith('/') ? url.slice(0, -1) : url;
    const normalizedUrl = url?.endsWith('/') ? url : `${url}/`;
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
