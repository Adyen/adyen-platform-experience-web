import { delay as mswDelay, DelayMode, HttpHandler } from 'msw';
import { mockWorker } from '../index';
import uuid from '../../../src/utils/random/uuid';
import { IGrantOfferResponseDTO } from '../../../src';

const IS_TEST = Boolean(process.env.E2E_TEST === 'true') || process.env.VITE_MODE === 'demo';
const MOCK_MODES = ['mocked', 'demo'];

export async function enableServerInMockedMode(enabled?: boolean) {
    const env = (import.meta as any).env;
    if (enabled || MOCK_MODES.includes(env.VITE_MODE || env.MODE)) {
        await mockWorker.start({
            onUnhandledRequest: ({ url }, print) => {
                const { pathname } = new URL(url);
                if (pathname.includes('images/logos/') || pathname.includes('node_modules') || pathname.includes('.svg')) return;

                print.warning();
            },
        });
    }
}

export function stopMockedServer() {
    mockWorker.stop();
}

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

export async function delay(duration?: DelayMode | number): Promise<void> {
    // Ensure there is no response delay in tests.
    return IS_TEST ? mswDelay(0) : mswDelay(duration);
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

export const calculateGrant = (amount: number | string, currency: string) => {
    const feesAmount = Math.round(Number(amount) * 0.11 * 100) / 100;
    const totalAmount = Number(amount) + feesAmount;

    const repaymentFrequencyDays = 30;
    const numberOfRepayments = Math.floor(180 / repaymentFrequencyDays);
    const minimumRepayment = Number(totalAmount / numberOfRepayments);

    const response = {
        grantAmount: {
            value: Number(amount),
            currency: currency,
        },
        feesAmount: {
            value: feesAmount,
            currency: currency,
        },
        totalAmount: {
            value: totalAmount,
            currency: currency,
        },
        thresholdAmount: {
            value: minimumRepayment,
            currency: currency,
        },
        repaymentRate: 1100,
        expectedRepaymentPeriodDays: 180,
        maximumRepaymentPeriodDays: 540,
        id: uuid(),
    } satisfies IGrantOfferResponseDTO;

    return response;
};
