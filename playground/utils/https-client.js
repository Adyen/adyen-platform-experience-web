import nodeFetch, { Headers } from 'node-fetch';

globalThis.fetch = nodeFetch;
globalThis.Headers = Headers;

class HttpClient {
    constructor(baseUrl, { apiKey, username, password }) {
        // Save baseUrl with stripped trailing slashes
        this.baseUrl = baseUrl.replace(/\/+$/g, '');
        const authHeaders = new Headers();
        if (apiKey) {
            const encodedApiKey = Buffer.from(apiKey).toString('base64');
            authHeaders.append('X-API-Key', encodedApiKey);
        } else {
            const encodedAuthPair = Buffer.from([username, password].join(':')).toString('base64');
            authHeaders.append('Authorization', `Basic ${encodedAuthPair}`);
        }

        this.authHeaders = authHeaders;

        return this;
    }

    async request(url, method, data) {
        const response = await fetch(url, {
            method,
            headers: this.authHeaders,
            body: JSON.stringify(data),
        });
        return await response.json();
    }

    httpGet(url, data) {
        return this.request(`${this.baseUrl}/${url}`, 'GET', data);
    }

    httpPost(url, data) {
        return this.request(`${this.baseUrl}/${url}`, 'POST', data);
    }

    httpPatch(url, data) {
        return this.request(`${this.baseUrl}/${url}`, 'PATCH', data);
    }
}

module.exports = HttpClient;
