import { sanitizeSession } from './utils';

describe('Session utils', () => {
    test('sanitizeSession', () => {
        const sessionMock = {
            id: 'CS123456',
            sessionData: 'ABC1234',
            otherField: '123'
        };

        const expectedSanitizedSession = {
            id: 'CS123456',
            sessionData: 'ABC1234'
        };

        expect(sanitizeSession(sessionMock)).toMatchObject(expectedSanitizedSession);
    });
});
