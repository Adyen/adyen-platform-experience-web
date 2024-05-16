export type Promised<T> = T | PromiseLike<T>;

export const enum PromiseState {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected',
}
