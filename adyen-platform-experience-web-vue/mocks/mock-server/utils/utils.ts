import { delay as mswDelay, DelayMode, HttpHandler } from 'msw';

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

export async function delay(duration?: DelayMode | number): Promise<void> {
    // Ensure there is no response delay in tests.
    return Number(process.env.TEST_ENV) === 1 ? mswDelay(0) : mswDelay(duration);
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
