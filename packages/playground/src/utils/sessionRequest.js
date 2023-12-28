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
};

export default getMySessionToken;
