import { endpoints } from '../../endpoints/endpoints';
import { http, HttpResponse } from 'msw';

const PREFIX = endpoints('mock').sessions;

export const sessionsMock = [
    http.post(`${PREFIX}`, () => {
        return HttpResponse.json({ id: 'test-id', token: 'test-token' });
    }),
];
