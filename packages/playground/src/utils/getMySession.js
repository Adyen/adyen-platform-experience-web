const baseUrl = 'http://localhost:3040';

export default async function getMySession() {
    const url = `${baseUrl}/getMySession`;
    const response = await fetch(url);
    return await response.json();
}
