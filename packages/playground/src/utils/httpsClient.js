const fetch = require('node-fetch');
globalThis.fetch = fetch
globalThis.Headers = fetch.Headers;
 
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
        const jsonData = await response.json();
        return jsonData;
    }

    httpGet (url, data) {
        return this.request(`${this.baseUrl}/${url}`, 'GET', data);
    }

    httpPost (url, data) {
        return this.request(`${this.baseUrl}/${url}`, 'POST', data);
    }

    httpPatch (url, data) {
        return this.request(`${this.baseUrl}/${url}`, 'PATCH', data);
    }
}

module.exports = HttpClient;