import { ref } from 'vue';

export const useMaxWidths = () => {
    const maxWidths = ref<number[]>([]);

    const updateMaxWidths = (widths: number[]) => {
        maxWidths.value = widths.every(width => !width)
            ? widths
            : widths.map((width, index) => {
                  const currentMax = maxWidths.value[index];
                  return !currentMax || width > currentMax ? width : currentMax;
              });
    };

    return { maxWidths, updateMaxWidths };
};
