import { struct } from '@src/utils/common';

export const createScopeChain = (() => {
    type Boundary<T extends {} = {}> = ({ [K in 'next' | 'prev']: Boundary<T> } & T) | null;

    const _append = <T extends {} = {}>(
        boundary: NonNullable<Boundary<T>>,
        root: Boundary<T> = null,
        current: Boundary<T> = null
    ): [Boundary<T>, Boundary<T>] => {
        if (!current) {
            boundary.next = boundary.prev = null;
            current = root = boundary;
        } else {
            boundary.next = null;
            boundary.prev = current;
            current = current.next = boundary;
        }

        return [root, current];
    };

    const _remove = <T extends {} = {}>(
        boundary: NonNullable<Boundary<T>>,
        root: Boundary<T> = null,
        current: Boundary<T> = null
    ): [Boundary<T>, Boundary<T>] => {
        if (boundary.next) boundary.next.prev = boundary.prev;
        if (boundary.prev) boundary.prev.next = boundary.next;

        if (boundary === current) current = boundary.prev;
        if (boundary === root) root = boundary.next;

        boundary.next = boundary.prev = null;
        return [root, current];
    };

    const _truncateAt = <T extends {} = {}>(
        boundary: NonNullable<Boundary<T>>,
        root: Boundary<T> = null,
        current: Boundary<T> = null
    ): [Boundary<T>, Boundary<T>] => {
        if (boundary.prev) {
            current = boundary.prev;
            current.next = null;
        } else current = root = null;

        boundary.next = boundary.prev = null;
        return [root, current];
    };

    return <T extends {} = {}>() => {
        type ScopeChain = Readonly<{
            add: (data?: T) => (isolatedDetach?: boolean) => void;
            current: Generator<Boundary<T>, void, Boundary<T> | undefined>;
        }>;

        let root: Boundary<T> = null;
        let current: Boundary<T> = null;

        const _createBoundary: ScopeChain['add'] = (data?: T) => {
            const boundary = struct({
                ...(data && Object.getOwnPropertyDescriptors(data)),
                next: { writable: true },
                prev: { writable: true },
            }) as NonNullable<Boundary<T>>;

            [root, current] = _append(boundary, root, current);

            return (isolatedDetach: boolean = false) => {
                if ((isolatedDetach as any) !== true) {
                    if (boundary.next === boundary.prev && boundary.prev === null && boundary !== root) return;
                    [root, current] = _truncateAt(boundary, root, current);
                } else [root, current] = _remove(boundary, root, current);
            };
        };

        return struct({
            add: { value: _createBoundary },
            current: {
                *get(): ScopeChain['current'] {
                    let _current = current;

                    while (_current) {
                        const current = yield _current;
                        _current = _current.prev || (current as Boundary<T>);
                    }
                },
            },
        }) as ScopeChain;
    };
})();
