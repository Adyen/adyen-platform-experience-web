const { host, protocol } = window.location;

export const httpPost = (endpoint, data) =>
    fetch(`${protocol}//${host}/${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json());

export const httpGet = (endpoint, request = {}) => {
    const url = new URL(`${protocol}//${host}/${endpoint}`);
    const searchParams = new URLSearchParams(request).toString();

    return fetch(`${url}?${searchParams}`, {
        method: 'get',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(response => response.json());
};