import { defineAsyncComponent } from 'vue';
import type VersionNoticeBanner from './VersionNoticeBanner.vue';

// A failed load renders nothing instead of reaching the error handlers of the host component.
const renderNothing = (() => null) as unknown as typeof VersionNoticeBanner;

/** Only fetched once there is a notice to show, so live environments never download it. */
export const LazyVersionNoticeBanner = defineAsyncComponent(() => import('./VersionNoticeBanner.vue').catch(() => renderNothing));
