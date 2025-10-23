export function bytesToBase64(bytes: Uint8Array) {
    const binString = Array.from(bytes, (byte: number) => String.fromCodePoint(byte)).join('');
    return btoa(binString);
}

export const encodeAnalyticsEvent = (event: any) => {
    try {
        const formattedOptions = JSON.stringify(event);
        const encodedData = bytesToBase64(new TextEncoder().encode(formattedOptions));
        const data = new URLSearchParams();
        data.set('data', encodedData);
        return data;
    } catch (err) {
        return null;
    }
};
