import { onMounted, onUnmounted } from 'vue';
import { transactionsOverviewEventBridge, type TransactionsView } from '../../events';

export const useTransactionsViewEvents = (view: TransactionsView) => {
    const events = transactionsOverviewEventBridge.useEvents();
    let startedAt: number | undefined;

    onMounted(() => {
        startedAt = performance.now();
        events.viewEntered({ view });
    });

    onUnmounted(() => {
        if (startedAt !== undefined) {
            events.viewDurationRecorded({ duration: Math.floor(performance.now() - startedAt), view });
        }
    });
};
