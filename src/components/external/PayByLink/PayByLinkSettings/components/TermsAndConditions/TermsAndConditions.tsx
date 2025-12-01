import { EMPTY_OBJECT, uniqueId } from '../../../../../../utils';
import './TermsAndConditions.scss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import { useFetch } from '../../../../../../hooks/useFetch';
import useMutation from '../../../../../../hooks/useMutation/useMutation';
import { PayByLinkTermsAndConditionsContainerProps } from './TermsAndConditionsContainer';
import { h } from 'preact';
import Button from '../../../../../internal/Button';
import { Checkbox } from '../../../../../internal/Checkbox';
import { ButtonVariant } from '../../../../../internal/Button/types';
import InputText from '../../../../../internal/FormFields/InputText';
import Typography from '../../../../../internal/Typography/Typography';
import Spinner from '../../../../../internal/Spinner';
import { TypographyVariant } from '../../../../../internal/Typography/types';

export const TermsAndConditions = ({ selectedStore }: PayByLinkTermsAndConditionsContainerProps) => {
    const { i18n } = useCoreContext();

    const initialTermsAndConditionsURL = useRef<string | undefined>();
    const checkboxIdentifier = useRef(uniqueId());
    const [termsAndConditionsURL, setTermsAndConditionsURL] = useState<string | undefined>();
    const [isRequirementsChecked, setIsRequirementsChecked] = useState(false);

    const { getPayByLinkSettings, updatePayByLinkSettings } = useConfigContext().endpoints;

    //TODO: Add error cases and loading cases
    const { data, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!getPayByLinkSettings,
                },
                queryFn: async () => getPayByLinkSettings?.(EMPTY_OBJECT, { path: { storeId: selectedStore } }),
            }),
            [getPayByLinkSettings, selectedStore]
        )
    );

    // const updatePayByLinkTermsAndConditions = useMutation({
    //     queryFn: updatePayByLinkSettings,
    //     options: {
    //         onSuccess: data => console.log(data),
    //     },
    // });

    // const onSave = useCallback(() => {
    //     if(!isRequirementsChecked) return;
    //    void updatePayByLinkTermsAndConditions.mutate(
    //         { contentType: 'application/json', body: { data: {termsAndConditionsURL} } },
    //         { path: { storeId: selectedStore! } }
    //     );
    // }, [isRequirementsChecked, selectedStore, termsAndConditionsURL, updatePayByLinkTermsAndConditions]);

    useEffect(() => {
        if (data?.data?.termsOfServiceUrl) {
            initialTermsAndConditionsURL.current = data?.data?.termsOfServiceUrl;
            setTermsAndConditionsURL(data?.data?.termsOfServiceUrl);
        }
    }, [data]);

    const onTermsAndConditionsURLInput = useCallback((e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        e.preventDefault();
        setTermsAndConditionsURL(e?.currentTarget?.value);
    }, []);

    const onCheckboxInput = useCallback((e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        e.preventDefault();
        setIsRequirementsChecked(e.currentTarget?.checked);
    }, []);

    const updatePayByLinkTermsAndConditions = useMutation({
        queryFn: updatePayByLinkSettings,
        options: {
            onSuccess: data => console.log(data),
        },
    });

    const onSave = useCallback(() => {
        if (!isRequirementsChecked) return;
        void updatePayByLinkTermsAndConditions.mutate(
            {
                contentType: 'application/json',
                body: {
                    termsAndConditionsURL: termsAndConditionsURL!,
                },
            },
            { path: { storeId: selectedStore! } }
        );
    }, [isRequirementsChecked, termsAndConditionsURL, updatePayByLinkTermsAndConditions, selectedStore]);

    const isLoading = isFetching;

    return (
        <section className="adyen-pe-pay-by-link-settings-terms-and-conditions">
            {isLoading ? (
                <Spinner size={'x-small'} />
            ) : (
                <>
                    <div className="adyen-pe-pay-by-link-settings__input-container">
                        <label
                            htmlFor={checkboxIdentifier.current}
                            aria-labelledby={checkboxIdentifier.current}
                            className="adyen-pe-pay-by-link-settings-terms-and-conditions-input__label"
                        >
                            <Typography
                                variant={TypographyVariant.BODY}
                                stronger
                                className="adyen-pe-pay-by-link-settings-terms-and-conditions-input__label--info-text"
                            >
                                {i18n.get('payByLink.settings.termsAndConditions.urlInput.label')}
                            </Typography>
                        </label>
                        <InputText uniqueId={checkboxIdentifier.current} value={termsAndConditionsURL} onInput={onTermsAndConditionsURLInput} />
                    </div>
                    <div className="adyen-pe-pay-by-link-settings-terms-and-conditions-checkbox__container">
                        <Checkbox
                            className={'adyen-pe-pay-by-link-settings-terms-and-conditions-checkbox'}
                            label={i18n.get('payByLink.settings.termsAndConditions.requirement.checkbox.text')}
                            onInput={onCheckboxInput}
                        />
                    </div>
                    <div className="adyen-pe-pay-by-link-settings__cta-container">
                        <Button variant={ButtonVariant.PRIMARY} onClick={onSave}>
                            {i18n.get('payByLink.settings.common.action.save')}
                        </Button>
                    </div>
                </>
            )}
        </section>
    );
};
