import { describe, expect, test } from 'vitest';
import { ByteScale, getByteScale, getFileSize, getHumanReadableFileSize } from './filesize';

describe('getByteScale', () => {
    test('should return NaN for NaN values', () => {
        expect(getByteScale(NaN)).toBe(NaN);
        expect(getByteScale(-NaN)).toBe(NaN);
        expect(getByteScale(Math.log(-10))).toBe(NaN);
    });

    test('should return Infinity for +Infinity', () => {
        expect(getByteScale(Infinity)).toBe(Infinity);
        expect(getByteScale(Number.POSITIVE_INFINITY)).toBe(Infinity);
        expect(getByteScale(1 / 0)).toBe(Infinity);
    });

    test('should return zero for numbers <= 1', () => {
        expect(getByteScale(1)).toBe(ByteScale.BYTES);
        expect(getByteScale(0.4)).toBe(ByteScale.BYTES);
        expect(getByteScale(0)).toBe(ByteScale.BYTES);
        expect(getByteScale(-0.0333)).toBe(ByteScale.BYTES);
        expect(getByteScale(-10)).toBe(ByteScale.BYTES);
        expect(getByteScale(-Infinity)).toBe(ByteScale.BYTES);
    });

    test('should return the correct byte scale for finite numbers > 1', () => {
        expect(getByteScale(512)).toBe(ByteScale.BYTES);
        expect(getByteScale(1_008)).toBe(ByteScale.BYTES);
        expect(getByteScale(7_552)).toBe(ByteScale.KB);
        expect(getByteScale(19_117)).toBe(ByteScale.KB);
        expect(getByteScale(463_187)).toBe(ByteScale.KB);
        expect(getByteScale(2_305_510)).toBe(ByteScale.MB);
        expect(getByteScale(20_423_894)).toBe(ByteScale.MB);
        expect(getByteScale(359_602_348)).toBe(ByteScale.MB);
        expect(getByteScale(4_735_845_924)).toBe(ByteScale.GB);
        expect(getByteScale(801_328_977_208)).toBe(ByteScale.GB);
        expect(getByteScale(1_801_328_977_208)).toBe(4);
    });
});

describe('getFileSize', () => {
    test('should return file size as 0 for bytes <= 0', () => {
        expect(getFileSize(0)).toMatchObject({ scale: ByteScale.BYTES, size: 0 });
        expect(getFileSize(-0.0333)).toMatchObject({ scale: ByteScale.BYTES, size: 0 });
        expect(getFileSize(-10)).toMatchObject({ scale: ByteScale.BYTES, size: 0 });
        expect(getFileSize(-Infinity)).toMatchObject({ scale: ByteScale.BYTES, size: 0 });
    });

    test('should ignore fractional bytes in file size', () => {
        expect(getFileSize(5.0333)).toMatchObject({ scale: ByteScale.BYTES, size: 5 });
        expect(getFileSize(120.45)).toMatchObject({ scale: ByteScale.BYTES, size: 120 });
        expect(getFileSize(899.0001)).toMatchObject({ scale: ByteScale.BYTES, size: 899 });
    });

    test('should return the expected approximate file size and scale', () => {
        expect(getFileSize(512)).toMatchObject({ scale: ByteScale.BYTES, size: 512 });
        expect(getFileSize(1_008)).toMatchObject({ scale: ByteScale.KB, size: 1 });
        expect(getFileSize(7_552)).toMatchObject({ scale: ByteScale.KB, size: 7.4 });
        expect(getFileSize(19_117)).toMatchObject({ scale: ByteScale.KB, size: 18.7 });
        expect(getFileSize(463_187)).toMatchObject({ scale: ByteScale.KB, size: 452 });
        expect(getFileSize(2_305_510)).toMatchObject({ scale: ByteScale.MB, size: 2.2 });
        expect(getFileSize(20_423_894)).toMatchObject({ scale: ByteScale.MB, size: 19.5 });
        expect(getFileSize(359_602_348)).toMatchObject({ scale: ByteScale.MB, size: 343 });
        expect(getFileSize(4_735_845_924)).toMatchObject({ scale: ByteScale.GB, size: 4.4 });
        expect(getFileSize(801_328_977_208)).toMatchObject({ scale: ByteScale.GB, size: 746 });
        expect(getFileSize(1_801_328_977_208)).toMatchObject({ scale: ByteScale.GB, size: 1680 });
    });
});

describe('getHumanReadableFileSize', () => {
    test('should return formatted file size with correct bytes pluralization', () => {
        expect(getHumanReadableFileSize(0)).toBe('0 bytes');
        expect(getHumanReadableFileSize(1)).toBe('1 byte');
        expect(getHumanReadableFileSize(100)).toBe('100 bytes');
    });

    test('should return the expected formatted file size', () => {
        expect(getHumanReadableFileSize(512)).toBe('512 bytes');
        expect(getHumanReadableFileSize(1_008)).toBe('1 KB');
        expect(getHumanReadableFileSize(7_552)).toBe('7.4 KB');
        expect(getHumanReadableFileSize(19_117)).toBe('18.7 KB');
        expect(getHumanReadableFileSize(463_187)).toBe('452 KB');
        expect(getHumanReadableFileSize(2_305_510)).toBe('2.2 MB');
        expect(getHumanReadableFileSize(20_423_894)).toBe('19.5 MB');
        expect(getHumanReadableFileSize(359_602_348)).toBe('343 MB');
        expect(getHumanReadableFileSize(4_735_845_924)).toBe('4.4 GB');
        expect(getHumanReadableFileSize(801_328_977_208)).toBe('746 GB');
        expect(getHumanReadableFileSize(1_801_328_977_208)).toBe('1680 GB');
    });
});
