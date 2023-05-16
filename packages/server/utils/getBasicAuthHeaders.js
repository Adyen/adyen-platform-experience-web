const { WS_USER, PASS } = process.env;

const getBasicAuthHeaders = body => {
    const auth = Buffer.from([WS_USER, PASS].join(':')).toString('base64');
    return new Headers({ 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', Authorization: `Basic ${auth}` });
};
export default getBasicAuthHeaders;
