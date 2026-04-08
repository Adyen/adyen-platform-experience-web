export const UUID_V4_REGEXP = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;

export const uuid = (() => {
    const _UUID_V4_FILLER_STRING = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

    return () =>
        _UUID_V4_FILLER_STRING.replace(/[xy]/g, xy => {
            const randomNibble = (Math.random() * 16) | 0;
            const nibble = xy == 'x' ? randomNibble : (randomNibble & 0x3) | 0x8;
            return nibble.toString(16);
        });
})();

export default uuid;
