import { ref, toValue, type MaybeRefOrGetter } from 'vue';

export const useCopyText = (textToCopy: MaybeRefOrGetter<string>, onCopyText?: () => void) => {
    const isCopied = ref(false);

    const resetCopyState = () => {
        isCopied.value = false;
    };

    const copyText = async () => {
        const text = toValue(textToCopy);

        if (!text || !navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            isCopied.value = true;
            onCopyText?.();
        } catch {
            // The Clipboard API can be unavailable or denied by the host browser.
        }
    };

    return {
        copyText,
        isCopied,
        resetCopyState,
    };
};
