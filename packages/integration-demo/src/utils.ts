// import { SessionRequest } from "@adyen/adyen-platform-experience-web/dist/types/core/ConfigContext";

declare const __API_KEY__: string;
declare const __SESSION_ACCOUNT_HOLDER__: string;
declare const __DEMO_PORT__: string;

export const getSessionToken = async () => {
    const requestData = {
        allowOrigin: `http://localhost:${__DEMO_PORT__}`,
        product: 'platform',
        policy: {
            resources: [
                {
                    accountHolderId: __SESSION_ACCOUNT_HOLDER__,
                    type: 'accountHolder',
                },
            ],
            roles: [
                'Transactions Overview Component: View',
                'Transactions Overview Component: Manage Refunds',
                'Reports Overview Component: View',
                'Capital Component: Manage',
                'Disputes Component: Manage',
                'Pay By Link Component: View',
                'Pay By Link Component: Manage Links',
                'Pay By Link Component: Manage Settings',
                'Payouts Overview Component: View',
            ],
        },
    };

    return fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': __API_KEY__,
        },
        body: JSON.stringify(requestData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching session token:', error);
            throw error;
        });
};
