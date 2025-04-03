/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { getAsBase64, getAsDataURL } from './read';

const FILE_TYPE = 'text/plain';
const FILE_CONTENT = 'Hello World!!!';
const BASE64_CONTENT = btoa(FILE_CONTENT);

const MOCK_FILE = new File([FILE_CONTENT], 'hello.txt', { type: FILE_TYPE });

describe('getAsBase64', () => {
    test('should return file content as Base64 string', async () => {
        const content = await getAsBase64(MOCK_FILE);
        expect(content).toBe(BASE64_CONTENT);
        expect(atob(content)).toBe(FILE_CONTENT);
    });
});

describe('getAsDataURL', () => {
    test('should return data URL for file', async () => {
        const dataUrl = await getAsDataURL(MOCK_FILE);
        expect(dataUrl).toBe(`data:${FILE_TYPE};base64,${BASE64_CONTENT}`);
    });
});
