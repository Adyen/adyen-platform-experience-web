interface DebouncedFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): void;
    cancel: () => void;
}

export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): DebouncedFunction<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;

    function debounced(...args: Parameters<T>): void {
        clearTimeout(timeoutId);
        lastArgs = args;

        timeoutId = setTimeout(() => {
            if (lastArgs) {
                func(...lastArgs);
            }
            lastArgs = undefined;
        }, delay);
    }

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
            lastArgs = undefined;
        }
    };

    return debounced;
};
