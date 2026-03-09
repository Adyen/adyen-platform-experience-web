import { ref } from 'vue';

export function useMaxWidthsState(): { maxWidths: ReturnType<typeof ref<number[]>>; setMaxWidths: (widths: number[]) => void } {
    const maxWidths = ref<number[]>([]);

    const setMaxWidths = (widths: number[]) => {
        if (widths.every(w => !w)) {
            maxWidths.value = widths;
        } else {
            maxWidths.value = widths.map((width, index) => {
                const currentMaxWidth = maxWidths.value[index];
                return !currentMaxWidth || width > currentMaxWidth ? width : currentMaxWidth;
            });
        }
    };

    return { maxWidths, setMaxWidths };
}
