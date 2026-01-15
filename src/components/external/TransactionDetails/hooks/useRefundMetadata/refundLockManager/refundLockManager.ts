export const refundLockManager = (() => {
    const LOCKED_TRANSACTIONS = new Map<string, number>();
    const LOCKED_DURATION_MS = 2 * 60 * 1000; // 2 minutes

    const isLocked = (transactionId: string) => LOCKED_TRANSACTIONS.has(transactionId);
    const unlock = (transactionId: string) => void LOCKED_TRANSACTIONS.delete(transactionId);

    const lock = (transactionId: string) => {
        // Delete first to ensure the key is moved to the end of the Map,
        // maintaining chronological order for the sync optimization.
        LOCKED_TRANSACTIONS.delete(transactionId);
        LOCKED_TRANSACTIONS.set(transactionId, Date.now() + LOCKED_DURATION_MS);
    };

    const sync = () => {
        const now = Date.now();

        for (const [transactionId, deadline] of LOCKED_TRANSACTIONS) {
            if (deadline > now) break;
            unlock(transactionId);
        }
    };

    return { isLocked, lock, unlock, sync } as const;
})();

export default refundLockManager;
