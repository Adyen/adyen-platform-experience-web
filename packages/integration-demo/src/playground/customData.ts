import { logEvent } from './events';

const STORE_LOCATIONS = [
    { store: 'Amsterdam', country: 'nl' },
    { store: 'Berlin', country: 'de' },
    { store: 'Madrid', country: 'es' },
    { store: 'São Paulo', country: 'br' },
    { store: 'Sydney', country: 'au' },
] as const;

const PRODUCTS = ['Coffee', 'Croissant', 'Gift card', 'Headphones', 'Sneakers'] as const;

const pick = <T>(items: readonly T[], seed = '') => items[[...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % items.length] as T;

export const getStore = (seed?: string) => pick(STORE_LOCATIONS, seed).store;

export const getProduct = (seed?: string) => pick(PRODUCTS, seed);

export const customFlag = (seed?: string) => {
    const { country } = pick(STORE_LOCATIONS, seed);
    return {
        type: 'icon',
        value: country.toUpperCase(),
        config: { src: `https://flagicons.lipis.dev/flags/4x3/${country}.svg`, alt: country },
    } as const;
};

export const customLink = (value: string) => ({ type: 'link', value, config: { href: 'https://www.adyen.com/', target: '_blank' } }) as const;

export const customButton = (value: string, detail?: unknown) =>
    ({ type: 'button', value, config: { action: () => logEvent(`Custom button "${value}"`, detail) } }) as const;
