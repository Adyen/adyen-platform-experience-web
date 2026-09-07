import { nextTick, ref, shallowRef, toValue, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export const useLiveAnnouncement = () => {
    const activeMessage = shallowRef<MaybeRefOrGetter<string>>();
    const announcement = ref('');
    let announcementId = 0;

    async function announce(message: MaybeRefOrGetter<string>) {
        const currentAnnouncementId = ++announcementId;
        activeMessage.value = message;
        announcement.value = '';

        // Let the cleared text render before restoring it,
        // so repeated identical messages are announced again.
        await nextTick();

        if (currentAnnouncementId === announcementId) {
            announcement.value = toValue(message);
        }
    }

    watch(
        () => (activeMessage.value ? toValue(activeMessage.value) : undefined),
        message => {
            // Update rendered announcement when the message getter changes.
            // Useful for reactive announcement localization with locale changes.
            if (message && announcement.value) {
                announcement.value = message;
            }
        }
    );

    return { announce, announcement };
};

export default useLiveAnnouncement;
