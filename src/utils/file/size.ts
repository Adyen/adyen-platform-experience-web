import { clamp } from '../value/number';

export const enum ByteScale {
    BYTES = 0,
    KB = 1,
    MB = 2,
    GB = 3,
}

export type FileSize = {
    /**
     * Byte scale of file.
     * Maximum byte scale is {@link MAX_BYTE_SCALE}.
     */
    scale: ByteScale;

    /**
     * Approximate (low precision) size of file at the given byte scale.
     * @example
     * { scale: ByteScale.KB, size: 34 } // approx. 34 KB
     * { scale: ByteScale.MB, size: 4.5 } // approx. 4.5 MB
     */
    size: number;
};

/**
 * Represents the maximum byte scale for file sizes.
 * Not expecting bytes beyond the GB (Scale 3) range.
 */
const MAX_BYTE_SCALE = ByteScale.GB satisfies ByteScale;

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
    // Hence, for values <= 1, the byte scale is the zero (0) minimum (ByteScale.BYTES)
    if (bytes <= 1) return ByteScale.BYTES;

    // Change base for computation using natural logarithms: log1024(x) => log(x) / log(1024)
    // The required computation becomes: floor( log(bytes) / log(1024) )
    return Math.floor(Math.log(bytes) / Math.log(1024)) as ByteScale;
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
    let scale = ByteScale.BYTES;

    // Clamp number of bytes to zero (0) minimum.
    // Round fractional bytes to the nearest integer.
    let size = Math.max(0, Math.round(bytes));

    if (size > 999) {
        // For sizes < 1024, the byte scale will be zero (0).
        // To approximate those sizes in KB (Scale 1) instead of bytes (Scale 0),
        // clamp the actual byte scale using 1 as the minimum byte scale.
        scale = clamp<ByteScale>(1, getByteScale(size), MAX_BYTE_SCALE);

        // Given the byte scale, the corresponding size is derived by: size / (1024 ^ scale)
        // For lower precision approximation of the size, only 3 significant digits is needed.
        // Finally, ensure a maximum precision of 1 decimal place: round( approx_size * 10 ) / 10
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
    /*
     * The human-readable file size string is formed by joining the approximate file size and the byte scale
     * unit (Bytes, KB, MB, etc.), both of which are separated by a non-breaking whitespace. Non-breaking
     * whitespace is used here instead of the regular whitespace to ensure that the human-readable file size
     * string is presented without any line breaks (whenever possible).
     */
    switch (scale) {
        case ByteScale.BYTES:
            return `${size} byte${size === 1 ? '' : 's'}`;
        case ByteScale.KB:
            return `${size} KB`;
        case ByteScale.MB:
            return `${size} MB`;
        case ByteScale.GB:
            return `${size} GB`;
    }
};
