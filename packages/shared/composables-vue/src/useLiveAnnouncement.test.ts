import { nextTick, ref } from 'vue';
import { expect, test } from 'vitest';
import { useLiveAnnouncement } from './useLiveAnnouncement';

test('re-announces the same message', async () => {
    const { announce, announcement } = useLiveAnnouncement();

    const firstAnnouncement = announce('Copied');
    expect(announcement.value).toBe('');

    await firstAnnouncement;
    expect(announcement.value).toBe('Copied');

    const secondAnnouncement = announce('Copied');
    expect(announcement.value).toBe('');

    await secondAnnouncement;
    expect(announcement.value).toBe('Copied');
});

test('updates the active announcement when its locale changes', async () => {
    const locale = ref('en');
    const { announce, announcement } = useLiveAnnouncement();

    await announce(() => (locale.value === 'en' ? 'Copied' : 'Copiado'));
    expect(announcement.value).toBe('Copied');

    locale.value = 'es';

    await nextTick();
    expect(announcement.value).toBe('Copiado');
});
