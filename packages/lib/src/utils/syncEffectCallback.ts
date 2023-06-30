const withSyncEffectCallback = (() => {
    type Callable = (...args: any[]) => any;
    const noex = Object.create(null);
    const noop = (fn: Callable) => fn;

    return (syncEffectCallback?: Callable) => {
        if (syncEffectCallback === undefined) return noop;

        const effectStack: Callable[] = [];

        return (fn: Callable) =>
            (...args: any[]) => {
                let exception = noex;
                try {
                    effectStack.push(fn);
                    return fn(...args);
                } catch (ex) {
                    exception = ex;
                    throw ex;
                } finally {
                    effectStack.pop();
                    if (effectStack.length === 0 && exception === noex) {
                        syncEffectCallback();
                    }
                }
            };
    };
})();

export default withSyncEffectCallback;
