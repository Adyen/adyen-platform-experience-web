import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { refundLockManager } from './refundLockManager';

describe('refundLockManager', () => {
    const SYSTEM_TIMESTAMP = 0;

    beforeAll(() => vi.useFakeTimers());
    beforeEach(() => vi.setSystemTime(SYSTEM_TIMESTAMP));

    afterEach(() => {
        // Advance time significantly (by 1 hour) and sync
        // This should clear all the refund locks
        vi.setSystemTime(SYSTEM_TIMESTAMP + 60 * 60 * 1000);
        refundLockManager.sync();
    });

    afterAll(() => vi.useRealTimers());

    it('should return false when checking if a non-locked transaction is locked', () => {
        expect(refundLockManager.isLocked('tx')).toBe(false);
    });

    it('should return true when checking if a locked transaction is locked', () => {
        refundLockManager.lock('tx');
        expect(refundLockManager.isLocked('tx')).toBe(true);
    });

    it('should unlock a transaction manually', () => {
        refundLockManager.lock('tx');
        refundLockManager.unlock('tx');
        expect(refundLockManager.isLocked('tx')).toBe(false);
    });

    it('should keep the transaction locked before the duration expires', () => {
        refundLockManager.lock('tx');

        // Advance time by 2m - 1ms
        vi.advanceTimersByTime(2 * 60 * 1000 - 1);
        refundLockManager.sync();

        expect(refundLockManager.isLocked('tx')).toBe(true);
    });

    it('should automatically unlock a transaction after the duration expires and sync is called', () => {
        refundLockManager.lock('tx');

        // Advance time by 2m + 1ms
        vi.advanceTimersByTime(2 * 60 * 1000 + 1);
        refundLockManager.sync();

        expect(refundLockManager.isLocked('tx')).toBe(false);
    });

    it('should handle multiple transactions with different expiration times', () => {
        refundLockManager.lock('tx1');
        vi.advanceTimersByTime(1000); // 1 second later
        refundLockManager.lock('tx2');

        // Current time (from start) => 1s
        // Advance to expire tx1 => 2m - 1s + 1ms
        vi.advanceTimersByTime(2 * 60 * 1000 - 1000 + 1);
        refundLockManager.sync();

        expect(refundLockManager.isLocked('tx1')).toBe(false);
        expect(refundLockManager.isLocked('tx2')).toBe(true);

        // Current time (from start) => 2m + 1ms
        // Advance to expire tx2 => 1s
        vi.advanceTimersByTime(1000);
        refundLockManager.sync();

        expect(refundLockManager.isLocked('tx2')).toBe(false);
    });

    it('should extend the lock duration when locking an already locked transaction', () => {
        refundLockManager.lock('tx1');
        vi.advanceTimersByTime(60 * 1000); // 1 minute later
        refundLockManager.lock('tx1'); // Re-lock (extends for another 2 minutes from now)

        // Advance 1m + 1ms (original expiration time)
        vi.advanceTimersByTime(60 * 1000 + 1);
        refundLockManager.sync();

        // Should still be locked
        expect(refundLockManager.isLocked('tx1')).toBe(true);

        // Advance another 1m (total 2 mins since re-lock)
        vi.advanceTimersByTime(60 * 1000);
        refundLockManager.sync();

        expect(refundLockManager.isLocked('tx1')).toBe(false);
    });
});
