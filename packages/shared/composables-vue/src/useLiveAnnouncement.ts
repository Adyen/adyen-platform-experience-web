import { getCurrentScope, nextTick, onScopeDispose, ref, shallowRef, toValue, watch, type MaybeRefOrGetter, type WatchHandle } from 'vue';

export const useLiveAnnouncement = () => {
    const activeMessage = shallowRef<MaybeRefOrGetter<string>>();
    const announcement = ref('');
    let announcementId = 0;
    let stopWatching: WatchHandle | undefined;

    if (getCurrentScope()) {
        onScopeDispose(() => stopWatching?.());
    }

    async function announce(message: MaybeRefOrGetter<string>) {
        stopWatching ??= watch(
            () => (activeMessage.value ? toValue(activeMessage.value) : undefined),
            nextMessage => {
                if (nextMessage && announcement.value) {
                    announcement.value = nextMessage;
                }
            }
        );
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

    return { announce, announcement };
};

export default useLiveAnnouncement;
