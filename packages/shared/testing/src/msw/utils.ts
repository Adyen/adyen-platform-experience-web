import { HttpHandler } from 'msw';

export const compareDates = (dateString1: string, dateString2: string, operator: 'ge' | 'le') => {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);

    switch (operator) {
        case 'ge':
            return date1 >= date2;
        case 'le':
            return date1 <= date2;
    }
};

/**
 * Hash function based on {@link https://theartincode.stanis.me/008-djb2/ djb2} algorithm
 */
export function computeHash(...strings: string[]) {
    const hash = strings.reduce((hash, string) => {
        let i = string.length;
        while (i) hash = (hash * 33) ^ string.charCodeAt(--i);
        return hash;
    }, 5381);
    return (hash >>> 0).toString(16).padStart(8, '0');
}

export function getMockHandlers(mocks: HttpHandler[][]): HttpHandler[] {
    const handlers = [] as HttpHandler[];
    mocks.forEach(mocks => handlers.push(...mocks));
    return handlers;
}

export const getPaginationLinks = (cursor: number, limit: number, totalLength: number) => {
    const potentialNextCursor = cursor + limit;
    const nextCursor = potentialNextCursor < totalLength ? potentialNextCursor : undefined;

    const potentialPrevCursor = cursor - limit;
    const prevCursor = potentialPrevCursor >= 0 ? potentialPrevCursor : undefined;

    return {
        ...(nextCursor === undefined ? {} : { next: { cursor: nextCursor.toString() } }),
        ...(prevCursor === undefined ? {} : { prev: { cursor: prevCursor.toString() } }),
    };
};
