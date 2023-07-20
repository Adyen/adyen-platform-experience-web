export const getBasicAuthHeaders = ({ user, pass }) => {
    let authToken = Buffer.from([user, pass].join(':')).toString('base64');
    return new Headers({ 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', Authorization: `Basic ${authToken}` });
};
