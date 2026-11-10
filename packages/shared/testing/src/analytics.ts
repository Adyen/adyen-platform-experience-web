export const decodeAnalyticsEvent = (payload: URLSearchParams): { event: string; properties: Record<string, unknown> } => {
    const encodedData = payload.get('data');
    if (!encodedData) throw new Error('Payload is missing its encoded data');

    const decodedBytes = Uint8Array.from(atob(encodedData), character => character.codePointAt(0)!);
    return JSON.parse(new TextDecoder().decode(decodedBytes));
};
