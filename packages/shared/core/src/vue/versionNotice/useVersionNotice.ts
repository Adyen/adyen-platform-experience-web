import { computed, onMounted, reactive, shallowRef } from 'vue';
import { getVersionNoticeId, persistDismissedVersionNoticeId, readDismissedVersionNoticeId } from '../../versionNotice/dismissal';
import type { VersionNotice } from '../../versionNotice/types';
import type { CoreInstance } from '../types';

// Shared by every mounted component, so dismissing one banner hides them all at once.
const dismissedInSession = reactive(new Set<string>());

export const useVersionNotice = (core: CoreInstance) => {
    const notice = shallowRef<VersionNotice | null>(null);

    onMounted(async () => {
        notice.value = await core.getVersionNotice();
    });

    const visibleNotice = computed(() => {
        if (!notice.value) return null;
        const noticeId = getVersionNoticeId(notice.value);
        return dismissedInSession.has(noticeId) || readDismissedVersionNoticeId() === noticeId ? null : notice.value;
    });

    const dismiss = () => {
        if (!notice.value) return;
        const noticeId = getVersionNoticeId(notice.value);
        dismissedInSession.add(noticeId);
        persistDismissedVersionNoticeId(noticeId);
    };

    return { notice: visibleNotice, dismiss };
};
