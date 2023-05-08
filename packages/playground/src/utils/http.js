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
    const searchParams = new URLSearchParams(Object.entries(request).filter(([param, value]) => value && param !== 'signal'));

    searchParams.forEach((value, param) => {
        const decodedValue = decodeURIComponent(value);
        if (decodedValue) url.searchParams.set(param, decodedValue);
    });

    return fetch(url, {
        method: 'GET',
        signal: request.signal,
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(response => response.json());
};