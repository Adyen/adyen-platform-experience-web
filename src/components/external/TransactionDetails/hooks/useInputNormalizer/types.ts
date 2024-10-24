export interface InputNormalizer {
    readonly normalize: (input: string, extensiveNormalization?: boolean) => string;
}
