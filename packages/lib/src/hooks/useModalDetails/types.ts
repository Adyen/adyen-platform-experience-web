import { TranslationKey } from '@src/core/Localization/types';
import { ModalSize } from '@src/components/internal/Modal/types';

type CallbackFunction<T> = (arg: T) => void;

type DetailsConfig<T> = {
    showDetails: boolean;
    callback?: CallbackFunction<T>;
};

export type SelectedDetail<Options> = {
    title?: TranslationKey;
    selection: { type: keyof Options; data: any };
    modalSize?: ModalSize;
};

export type GetArgsExceptCallback<T extends Required<DetailsConfig<any>>> = Omit<Parameters<T['callback']>[0], 'showModal'>;

export type ModalDetailsOptions = {
    [k: string]: DetailsConfig<any>;
};

export type CallbackIsPresent<Options extends ModalDetailsOptions, T extends SelectedDetail<Options>> = Options[T['selection']['type']] extends {
    callback: any;
}
    ? true
    : false;

export type CallbackParams<Options extends ModalDetailsOptions, T extends SelectedDetail<Options>> = {
    callback: (
        args: Options[T['selection']['type']] extends { callback: any } ? GetArgsExceptCallback<Required<Options[T['selection']['type']]>> : never
    ) => void;
};
export function hasCallback(options: any): options is Required<DetailsConfig<any>> {
    return 'callback' in options;
}
