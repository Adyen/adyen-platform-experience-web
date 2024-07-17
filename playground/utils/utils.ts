const { host, protocol } = window.location;
export const httpPost = (endpoint: string, data: Record<any, any>) =>
    fetch(`${protocol}//${host}/${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(response => response.json());
export const getSearchParameters = (search: string = window.location.search): Record<string, string> => {
    return Object.fromEntries(new URLSearchParams(search).entries());
};

export const getDefaultID = (fallbackID: string) => (window as any).defaultID ?? fallbackID;

export const TEST_CONFIG = (window as any).testConfig ?? {};
