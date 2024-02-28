import { TranslationKey } from '@src/core/Localization/types';
import { ModalSize } from '@src/components/internal/Modal/types';

type CallbackFunction<T> = (arg: T) => void;

type DetailsConfig<T> = {
    showDetails: (boolean | undefined)[];
    callback?: CallbackFunction<T>;
};

export type SelectedDetail = {
    title?: TranslationKey;
    selection: any;
    modalSize?: ModalSize;
};

export type GetArgsExceptCallback<T extends Required<DetailsConfig<any>>> = Omit<Parameters<T['callback']>[0], 'showModal'>;

export type ModalDetailsOptions = {
    [k: string]: DetailsConfig<any>;
};

export type CallbackIsPresent<Options extends ModalDetailsOptions> = Options['transaction'] extends {
    callback: any;
}
    ? true
    : false;

export type CallbackParams<Options extends ModalDetailsOptions> = {
    callback: (args: Options['transaction'] extends { callback: any } ? GetArgsExceptCallback<Required<Options['transaction']>> : never) => void;
};
export function hasCallback(options: any): options is Required<DetailsConfig<any>> {
    return 'callback' in options;
}
