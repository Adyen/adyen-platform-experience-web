import createDuplexTransactionNavigator from './createDuplexTransactionNavigator';
import { useContext, useEffect, useState } from 'preact/hooks';
import { memo, PropsWithChildren } from 'preact/compat';
import { createContext } from 'preact';

const duplexTransactionNavigator = createDuplexTransactionNavigator();
const TransactionNavigatorContext = createContext({ ...duplexTransactionNavigator });

export const TransactionNavigatorProvider = memo(({ children }: PropsWithChildren) => {
    const [_, setLastNavigationTimestamp] = useState(performance.now());

    useEffect(() => {
        duplexTransactionNavigator.onNavigation = () => setLastNavigationTimestamp(performance.now());
        return () => {
            duplexTransactionNavigator.onNavigation = null;
            duplexTransactionNavigator.reset();
        };
    }, []);

    return <TransactionNavigatorContext.Provider value={{ ...duplexTransactionNavigator }}>{children}</TransactionNavigatorContext.Provider>;
});

export const useTransactionNavigatorContext = () => useContext(TransactionNavigatorContext);
export default useTransactionNavigatorContext;
