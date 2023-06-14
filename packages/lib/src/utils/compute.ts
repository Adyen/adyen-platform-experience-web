export const unsignedModulo = (num: number, modulo: number) => {
    const mod = num % modulo;
    return mod > 0 ? mod : (mod + modulo) % modulo;
};
