import { useCallback, useMemo, useState } from 'preact/hooks';
import { TranslationKey } from '@src/core/Localization/types';
import { ModalSize } from '@src/components/internal/Modal/types';

type SelectedDetail<Options> = {
    title: TranslationKey;
    selection: { type: keyof Options; detail: any };
    modalSize?: ModalSize;
};

type CallbackFunction<T> = (arg: T) => void;

type DetailsConfig<T> = {
    showDetails: (boolean | undefined)[];
    callback?: CallbackFunction<T>;
};

type GetArgsExceptCallback<T extends Required<DetailsConfig<any>>> = Omit<Parameters<T['callback']>[0], 'showModal'>;

type ModalDetailsOptions = {
    [k: string]: DetailsConfig<any>;
};

type CallbackIsPresent<Options extends ModalDetailsOptions, T extends SelectedDetail<Options>> = Options[T['selection']['type']] extends {
    callback: any;
}
    ? true
    : false;

type CallbackParams<Options extends ModalDetailsOptions, T extends SelectedDetail<Options>> = {
    callback: (
        args: Options[T['selection']['type']] extends { callback: any } ? GetArgsExceptCallback<Required<Options[T['selection']['type']]>> : never
    ) => void;
};
function hasCallback(options: any): options is Required<DetailsConfig<any>> {
    return 'callback' in options;
}

/**
 * @param options - This parameter is an object that contains several fields.
 *                  The keys of these fields represent the type of details that will be displayed on a modal.
 *                  - showDetails: An array of values that determine whether the details should be shown on the modal.
 *                                 If this field is undefined, it will be assumed to be true.
 *                  - callback?: An optional function that will be executed at the merchant level.
 *                               This function will receive a 'showModal' function as a parameter,
 *                               which allows the merchant to control when the modal appears.
 */

function useModalDetails<Options extends ModalDetailsOptions>(options: Options) {
    const [selectedDetail, setSelectedDetail] = useState<SelectedDetail<Options> | null>(null);
    const updateDetails = useCallback(
        <T extends SelectedDetail<Options>>(state: T): CallbackIsPresent<Options, T> extends true ? CallbackParams<Options, T> : {} => {
            if (state && hasCallback(options[state.selection.type])) {
                return {
                    callback: options[state.selection.type]?.callback
                        ? (
                              args: Options[T['selection']['type']] extends { callback: any }
                                  ? GetArgsExceptCallback<Required<Options[T['selection']['type']]>>
                                  : never
                          ) => options[state.selection.type]?.callback?.({ showModal: () => setSelectedDetail(state), ...args })
                        : () => setSelectedDetail(state),
                };
            }
            setSelectedDetail(state);
            return {} as CallbackIsPresent<Options, T> extends true ? CallbackParams<Options, T> : {};
        },
        [options]
    );
    const resetDetails = useCallback(() => setSelectedDetail(null), []);

    const detailsToShow = useMemo(() => {
        const details = {} as { [key in keyof Options]: boolean };

        for (const detail in options) {
            const selectedDetail = options[detail];
            details[detail] = !selectedDetail?.showDetails.some(v => v === false) || !!selectedDetail.callback;
        }

        return details;
    }, [options]);

    return {
        selectedDetail,
        updateDetails,
        detailsToShow,
        resetDetails,
    };
}

export default useModalDetails;
