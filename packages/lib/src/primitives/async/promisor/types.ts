import type { ListWithoutFirst, Promised } from '../../../utils/types';

export interface Promisor<Fn extends (signal: AbortSignal, ...args: any[]) => Promised<any>> {
    (...args: ListWithoutFirst<Parameters<Fn>>): Promise<Awaited<ReturnType<Fn>>>;
    readonly abort: () => void;
    get promise(): Promise<Awaited<ReturnType<Fn>>>;
}

export interface PromisorFactory {
    <Fn extends (signal: AbortSignal, ...args: any[]) => Promised<any>>(fn: Fn): Promisor<Fn>;
}
