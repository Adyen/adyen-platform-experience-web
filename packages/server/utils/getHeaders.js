const { API_KEY } = process.env;

module.exports = () => ({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY
});