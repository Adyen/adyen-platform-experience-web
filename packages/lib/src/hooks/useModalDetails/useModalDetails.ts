import { useCallback, useMemo, useState } from 'preact/hooks';
import { CallbackIsPresent, CallbackParams, GetArgsExceptCallback, hasCallback, ModalDetailsOptions, SelectedDetail } from './types';

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
    const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);
    const updateDetails = useCallback(
        <T extends SelectedDetail>(state: T): CallbackIsPresent<Options> extends true ? CallbackParams<Options> : {} => {
            if (state && hasCallback(options['transaction'])) {
                return {
                    callback: options?.callback
                        ? (
                              args: Options['transaction'] extends { callback: any } ? GetArgsExceptCallback<Required<Options['transaction']>> : never
                          ) => options['transaction']?.callback?.({ showModal: () => setSelectedDetail(state), ...args })
                        : () => setSelectedDetail(state),
                };
            }
            setSelectedDetail(state);
            return {} as CallbackIsPresent<Options> extends true ? CallbackParams<Options> : {};
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
