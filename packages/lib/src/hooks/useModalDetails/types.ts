import { TranslationKey } from '../../core/Localization/types';
import { ModalSize } from '../../components/internal/Modal/types';

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

export type ModalDetailsOptions<Options extends string> = {
    [k in Options]: DetailsConfig<any>;
};

export type CallbackIsPresent<
    Opt extends ModalDetailsOptions<any>,
    Options extends ModalDetailsOptions<Extract<keyof Opt, string>>,
    T extends SelectedDetail<Options>
> = Options[T['selection']['type']] extends {
    callback: any;
}
    ? true
    : false;

export type CallbackParams<
    Opt extends ModalDetailsOptions<any>,
    Options extends ModalDetailsOptions<Extract<keyof Opt, string>>,
    T extends SelectedDetail<Options>
> = {
    callback: (
        args: Options[T['selection']['type']] extends { callback: any } ? GetArgsExceptCallback<Required<Options[T['selection']['type']]>> : never
    ) => void;
};
export function hasCallback(options: any): options is Required<DetailsConfig<any>> {
    return 'callback' in options;
}
