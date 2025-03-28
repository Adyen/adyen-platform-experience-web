import { clamp } from '../../../../../utils';

export type ByteScale = FileSize['scale'];

export type FileSize = {
    /**
     * Byte scale of file.
     * Maximum byte scale is {@link MAX_BYTE_SCALE}.
     *
     * - Scale 0 => Bytes
     * - Scale 1 => KB
     * - Scale 2 => MB
     * - Scale 3 => GB
     */
    scale: 0 | 1 | 2 | 3;

    /**
     * Approximate (low precision) size of file at the given byte scale.
     * @example
     * { scale: 1, size: 34 } // approx. 34 KB
     * { scale: 2, size: 4.5 } // approx. 4.5 MB
     */
    size: number;
};

/**
 * Represents the maximum byte scale for file sizes.
 * Not expecting bytes beyond the GB (Scale 3) range.
 */
const MAX_BYTE_SCALE = 3 satisfies ByteScale;

/**
 * Given a number of bytes, will compute and return the corresponding {@link ByteScale byte scale}.
 * May return an integer greater than 3 if given a sufficiently large number of bytes,
 * though the predefined {@link MAX_BYTE_SCALE maximum byte scale} value is 3.
 *
 * @param bytes - Number of bytes
 */
export const getByteScale = (bytes: number): ByteScale => {
    // Computations involving logarithms are used to determine the byte scale.
    // The base for computation is 1024 (since 1024 bytes => 1KB, 1024KB => 1MB, 1024MB => 1GB).
    // The required computation is: floor( log1024(bytes) )

    // Logarithms are positive for values > 1, and not defined for values <= 0.
    // Hence, for values <= 1, the byte scale is the zero (0) minimum.
    if (bytes <= 1) return 0;

    // Changing to base 2 for computation since log2(1024) is 10 (because 2^10 => 1024).
    // Changing of base: log1024(x) => log2(x) / log2(1024) => log2(x) / 10
    // The required computation becomes: floor( log2(bytes) / 10 )
    return Math.floor(Math.log2(bytes) / 10) as ByteScale;
};

/**
 * Given a number of bytes, will compute and return the approximate low-precision {@link FileSize file size}
 * at the most appropriate {@link ByteScale byte scale}. For sufficiently large number of bytes, the scale is
 * capped at the predefined {@link MAX_BYTE_SCALE maximum byte scale} value of 3. Hence, the size for bytes
 * beyond the GB range, for example, will be expressed as integers greater than 1000.
 *
 * @param bytes - Number of bytes
 */
export const getFileSize = (bytes: number): Readonly<FileSize> => {
    let scale: ByteScale = 0;

    // Clamp number of bytes to zero (0) minimum.
    // Ignore negligible fractional bytes.
    let size = Math.max(0, Math.trunc(bytes));

    if (size > 999) {
        // For sizes < 1024, the byte scale will be zero (0).
        // To approximate those sizes in KB (Scale 1) instead of bytes (Scale 0),
        // clamp the actual byte scale using 1 as the minimum byte scale.
        scale = clamp(1, getByteScale(size), MAX_BYTE_SCALE) as ByteScale;

        // Given the byte scale, the corresponding size is derived by: size / (1024 ^ scale)
        // For lower precision approximation of the size, only 3 significant digits is needed.
        // Finally, a small correction for floating-point precision: round( approx_size * 10 ) / 10
        size = Math.round(Number((size / 1024 ** scale).toPrecision(3)) * 10) / 10;
    }

    return { scale, size } as const;
};

/**
 * Given a number of bytes, will compute and return the approximate low-precision {@link FileSize file size}
 * as human-readable string (e.g. 512 bytes, 23.1 KB, 4.4 GB, etc.)
 *
 * @param bytes - Number of bytes
 */
export const getHumanReadableFileSize = (bytes: number): string => {
    const { scale, size } = getFileSize(bytes);
    switch (scale) {
        case 0:
            return `${size} byte${size === 1 ? '' : 's'}`;
        case 1:
            return `${size} KB`;
        case 2:
            return `${size} MB`;
        case 3:
            return `${size} GB`;
    }
};
