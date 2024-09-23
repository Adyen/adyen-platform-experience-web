import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';

const PREFIX = endpoints('mock').sessions;

export const sessionsMock = [
    http.post(`${PREFIX}`, () => {
        return HttpResponse.json({ id: 'test-id', token: 'test-token' });
    }),
];
