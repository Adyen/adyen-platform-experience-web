import { useCallback, useState } from 'preact/hooks';

export const useMaxWidthsState = (): [number[], (widths: number[]) => void] => {
    const [maxWidths, setMaxWidths] = useState<number[]>([]);
    const setMaxWidthsConditionally = useCallback((widths: number[]) => {
        setMaxWidths(currentMaxWidths =>
            widths.every(width => !width)
                ? widths
                : widths.map((width, index) => {
                      const currentMaxWidth = currentMaxWidths[index];
                      return !currentMaxWidth || width > currentMaxWidth ? width : currentMaxWidth;
                  })
        );
    }, []);
    return [maxWidths, setMaxWidthsConditionally];
};
