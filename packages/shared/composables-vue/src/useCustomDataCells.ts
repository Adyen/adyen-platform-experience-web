import type { CustomDataObject, CustomButtonObject, CustomIconObject, CustomLinkObject } from '@integration-components/types';

export const isCustomDataObject = (item: unknown): item is CustomDataObject => {
    return !!item && typeof item === 'object' && 'value' in item;
};

export const isIconType = (item: unknown): item is CustomIconObject => {
    return !!item && typeof item === 'object' && (item as any).type === 'icon';
};

export const isButtonType = (item: unknown): item is CustomButtonObject => {
    return !!item && typeof item === 'object' && (item as any).type === 'button';
};

export const isLinkType = (item: unknown): item is CustomLinkObject => {
    return !!item && typeof item === 'object' && (item as any).type === 'link';
};

export function useCustomDataCells() {
    return { isCustomDataObject, isIconType, isButtonType, isLinkType } as const;
}

export default useCustomDataCells;
