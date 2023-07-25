const { API_KEY } = process.env;

const getHeaders = (body, apiKey) => ({
    ...(body && { 'Content-Length': String(Buffer.byteLength(body, 'utf8')) }),
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'X-Api-Key': apiKey ?? API_KEY,
});
export default getHeaders;
