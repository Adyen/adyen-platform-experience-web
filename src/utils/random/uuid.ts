export const UUID_V4_REGEXP = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

// fallback for older runtimes without support for `crypto.randomUUID()`
const randomUUID = (() => {
    const _UUID_V4_FILLER_STRING: UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

    return () => {
        const randomBytes = crypto.getRandomValues(new Uint8Array(16));
        let byteIndex = 0;

        return _UUID_V4_FILLER_STRING.replace(/[xy]/g, xy => {
            const byte = randomBytes[byteIndex >> 1]!;
            const randomNibble = (byteIndex % 2 ? byte >> 4 : byte) & 0xf;
            const nibble = xy == 'x' ? randomNibble : (randomNibble & 0x3) | 0x8;
            byteIndex++;
            return nibble.toString(16);
        }) as UUID;
    };
})();

// prettier-ignore
export const uuid = typeof crypto.randomUUID === 'function'
    ? () => crypto.randomUUID()
    : randomUUID;

export default uuid;
