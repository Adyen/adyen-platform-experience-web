const memoComparator = (() => {
    const identity = <T = any>(value?: T) => value;

    const comparator = (<T = {}>(getters?: { [K in keyof T]?: (value?: T[K]) => any }) =>
        (prev: T, next: T) => {
            for (const key in prev) {
                let getter = getters?.[key];
                getter = typeof getter !== 'function' ? identity : getter;
                if (getter(prev[key]) !== getter(next[key])) return false;
            }
            return true;
        }) as {
        <T = {}>(getters?: { [K in keyof T]?: (value?: T[K]) => any }): (prev: T, next: T) => boolean;
        exclude: () => void;
    };

    return Object.defineProperty(comparator, 'exclude', { value: () => {} });
})();

export default memoComparator;
