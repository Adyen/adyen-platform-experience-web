import type { ToolArguments } from './types';

/** The model passed arguments that do not fit the tool. The message is sent back to the model so it can correct the call. */
export class ToolArgumentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ToolArgumentError';
    }
}

interface ReadOptions {
    required?: boolean;
}

const isPresent = (value: unknown) => value !== undefined && value !== null && value !== '';

export const readString = (args: ToolArguments, key: string, { required = false }: ReadOptions = {}): string | undefined => {
    const value = args[key];

    if (!isPresent(value)) {
        if (required) throw new ToolArgumentError(`"${key}" is required.`);
        return undefined;
    }

    if (typeof value !== 'string') throw new ToolArgumentError(`"${key}" must be a string.`);
    return value;
};

/** Reads an identifier that ends up in a URL path, so it may only contain characters IDs and PSP references use. */
export const readId = (args: ToolArguments, key: string): string => {
    const value = readString(args, key, { required: true })!;
    if (!/^[\w.-]{1,100}$/.test(value)) throw new ToolArgumentError(`"${key}" is not a valid identifier.`);
    return value;
};

/** Reads a timestamp that identifies a record, e.g. a payout's `createdAt`. It must parse as a date but is passed on exactly as given. */
export const readTimestamp = (args: ToolArguments, key: string): string => {
    const value = readString(args, key, { required: true })!;
    if (Number.isNaN(Date.parse(value))) throw new ToolArgumentError(`"${key}" must be a timestamp copied exactly from the list result.`);
    return value;
};

/** Reads an ISO 8601 date or date-time and returns it normalized to a full UTC timestamp. */
export const readDateTime = (args: ToolArguments, key: string, options: ReadOptions = {}): string | undefined => {
    const value = readString(args, key, options);
    if (value === undefined) return undefined;

    const time = Date.parse(value);
    if (Number.isNaN(time)) throw new ToolArgumentError(`"${key}" must be an ISO 8601 date or date-time, for example 2025-01-31T23:59:59Z.`);
    return new Date(time).toISOString();
};

export const readEnum = <Value extends string>(
    args: ToolArguments,
    key: string,
    allowed: readonly Value[],
    options: ReadOptions = {}
): Value | undefined => {
    const value = readString(args, key, options);
    if (value === undefined) return undefined;
    if (!allowed.includes(value as Value)) throw new ToolArgumentError(`"${key}" must be one of: ${allowed.join(', ')}.`);
    return value as Value;
};

export const readEnumList = <Value extends string>(args: ToolArguments, key: string, allowed: readonly Value[]): Value[] | undefined => {
    const value = args[key];
    if (!isPresent(value)) return undefined;

    const values = Array.isArray(value) ? value : [value];
    const invalid = values.filter(item => typeof item !== 'string' || !allowed.includes(item as Value));
    if (invalid.length > 0) throw new ToolArgumentError(`"${key}" may only contain: ${allowed.join(', ')}.`);

    return values.length > 0 ? (values as Value[]) : undefined;
};

/** Reads a list of ISO 4217 currency codes (e.g. `["EUR", "USD"]`). Lowercase codes are accepted and upper-cased. */
export const readCurrencyList = (args: ToolArguments, key: string): string[] | undefined => {
    const value = args[key];
    if (!isPresent(value)) return undefined;

    const values = (Array.isArray(value) ? value : [value]).map(item => (typeof item === 'string' ? item.trim().toUpperCase() : item));
    if (values.some(item => typeof item !== 'string' || !/^[A-Z]{3}$/.test(item))) {
        throw new ToolArgumentError(`"${key}" may only contain three-letter ISO 4217 currency codes, e.g. EUR.`);
    }

    return values.length > 0 ? (values as string[]) : undefined;
};

export const readLimit = (args: ToolArguments, allowed: readonly number[], fallback: number): number => {
    const value = args.limit;
    if (!isPresent(value)) return fallback;
    if (typeof value !== 'number' || !allowed.includes(value)) throw new ToolArgumentError(`"limit" must be one of: ${allowed.join(', ')}.`);
    return value;
};
