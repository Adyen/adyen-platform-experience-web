import { VERSION_NOTICE_STORAGE_KEY } from './constants';
import type { VersionNotice } from './types';

/** Identifies a notice by everything it tells, so a dismissal never hides a notice about another version. */
export const getVersionNoticeId = (notice: VersionNotice) =>
    `${notice.kind}:${notice.currentVersion}:${notice.kind === 'outdated' ? notice.latestVersion : ''}`;

// Storage can be unavailable (private browsing, sandboxed iframes); dismissals then only last for the session.
export const readDismissedVersionNoticeId = (): string | null => {
    try {
        return window.localStorage.getItem(VERSION_NOTICE_STORAGE_KEY);
    } catch {
        return null;
    }
};

export const persistDismissedVersionNoticeId = (noticeId: string) => {
    try {
        window.localStorage.setItem(VERSION_NOTICE_STORAGE_KEY, noticeId);
    } catch {
        /* the session dismissal still applies */
    }
};
