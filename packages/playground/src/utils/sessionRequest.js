const getMySessionToken = async () => {
    const url = new URL(`${process.env.VITE_API_URL}authe/api/v1/sessions`);
    const body = {
        allowOrigin: 'http://localhost',
        reference: 'platfrom-operations',
        product: 'platform',
        policy: {
            resources: [],
            roles: ['Transfers List Component - Read'],
        },
    };
    return fetch(url, { method: 'POST', body: JSON.stringify(body) });

    // return Promise.resolve({ id: '18fbb75e-b53b-40c3-88a4-3a1b7cc92bd1', token: Math.random().toString(), clientKey: Math.random().toString() });
};

export default getMySessionToken;
