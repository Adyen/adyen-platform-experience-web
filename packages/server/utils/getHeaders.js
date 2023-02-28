const { API_KEY } = process.env;

module.exports = body => ({
    ...(body && { 'Content-Length': Buffer.byteLength(body, 'utf8') }),
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY
});