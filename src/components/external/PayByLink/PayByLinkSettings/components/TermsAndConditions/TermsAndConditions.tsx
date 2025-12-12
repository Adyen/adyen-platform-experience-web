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
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { AlertTypeOption } from '../../../../../internal/Alert/types';
import Alert from '../../../../../internal/Alert/Alert';
import Icon from '../../../../../internal/Icon';

export const TermsAndConditions = ({ selectedStore }: PayByLinkTermsAndConditionsContainerProps) => {
    const { i18n } = useCoreContext();

    const initialTermsAndConditionsURL = useRef<string | undefined>();
    const checkboxIdentifier = useRef(uniqueId());
    const [termsAndConditionsURL, setTermsAndConditionsURL] = useState<string | undefined>('');
    const [isRequirementsChecked, setIsRequirementsChecked] = useState(false);
    const [showNotCheckedRequirementsError, setShowNotCheckedRequirementsError] = useState(false);
    const [showInvalidURL, setShowInvalidURL] = useState(false);
    const [isTermsAndConditionsChanged, setIsTermsAndConditionsChanged] = useState(false);

    const { getPayByLinkSettings, savePayByLinkSettings } = useConfigContext().endpoints;

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

    useEffect(() => {
        if (data?.termsOfServiceUrl) {
            initialTermsAndConditionsURL.current = data?.termsOfServiceUrl ?? '';
            setTermsAndConditionsURL(data?.termsOfServiceUrl ?? '');
        }
    }, [data]);

    const onTermsAndConditionsURLInput = useCallback((e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        e.preventDefault();
        setShowInvalidURL(false);
        if (initialTermsAndConditionsURL.current && initialTermsAndConditionsURL.current !== e?.currentTarget?.value) {
            setIsTermsAndConditionsChanged(true);
        }
        if (initialTermsAndConditionsURL.current && initialTermsAndConditionsURL.current === e?.currentTarget?.value) {
            setIsTermsAndConditionsChanged(false);
        }
        setTermsAndConditionsURL(e?.currentTarget?.value);
    }, []);

    const onCheckboxInput = useCallback((e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.currentTarget?.checked) setShowNotCheckedRequirementsError(false);
        setIsRequirementsChecked(e.currentTarget?.checked);
    }, []);

    const updatePayByLinkTermsAndConditions = useMutation({
        queryFn: savePayByLinkSettings,
        options: {
            onSuccess: () => {
                setIsTermsAndConditionsChanged(false);
                setShowInvalidURL(false);
                setShowNotCheckedRequirementsError(false);
                setIsRequirementsChecked(false);
                initialTermsAndConditionsURL.current = termsAndConditionsURL;
            },
        },
    });

    const isInputsValid = useCallback(() => {
        if (!isRequirementsChecked || termsAndConditionsURL === initialTermsAndConditionsURL.current) {
            setShowNotCheckedRequirementsError(true);
        }

        const isValidUrl =
            termsAndConditionsURL === ''
                ? true
                : !termsAndConditionsURL
                  ? false
                  : termsAndConditionsURL.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

        if (!isValidUrl) {
            setShowInvalidURL(true);
        }
        return isRequirementsChecked && isValidUrl;
    }, [isRequirementsChecked, termsAndConditionsURL, setShowInvalidURL]);

    const onSave = useCallback(() => {
        if (!isInputsValid()) {
            return;
        }
        updatePayByLinkTermsAndConditions.mutate(
            {
                contentType: 'application/json',
                body: {
                    termsOfServiceUrl: termsAndConditionsURL!,
                },
            },
            { path: { storeId: selectedStore! } }
        );
    }, [termsAndConditionsURL, updatePayByLinkTermsAndConditions, selectedStore, isInputsValid]);

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
                        {showInvalidURL && (
                            <div className="adyen-pe-pay-by-link-settings-terms-and-conditions__error">
                                <Icon name="cross-circle-fill" className={'adyen-pe-pay-by-link-settings-terms-and-conditions__error-icon'} />
                                <Typography
                                    className={'adyen-pe-pay-by-link-settings-terms-and-conditions__error-text'}
                                    el={TypographyElement.SPAN}
                                    variant={TypographyVariant.BODY}
                                >
                                    {i18n.get('payByLink.settings.termsAndConditions.error.url.validation')}
                                </Typography>
                            </div>
                        )}
                    </div>
                    {isTermsAndConditionsChanged && (
                        <Alert type={AlertTypeOption.WARNING} description={i18n.get('payByLink.settings.termsAndConditions.alert.urlChange')} />
                    )}
                    <div className="adyen-pe-pay-by-link-settings-terms-and-conditions-checkbox__container">
                        <Checkbox
                            checked={isRequirementsChecked}
                            className={'adyen-pe-pay-by-link-settings-terms-and-conditions-checkbox'}
                            label={i18n.get('payByLink.settings.termsAndConditions.requirement.checkbox.text')}
                            onInput={onCheckboxInput}
                        />
                        {showNotCheckedRequirementsError && (
                            <div className="adyen-pe-pay-by-link-settings-terms-and-conditions__error">
                                <Icon name="cross-circle-fill" className={'adyen-pe-pay-by-link-settings-terms-and-conditions__error-icon'} />
                                <Typography
                                    className={'adyen-pe-pay-by-link-settings-terms-and-conditions__error-text'}
                                    el={TypographyElement.SPAN}
                                    variant={TypographyVariant.BODY}
                                >
                                    {i18n.get('payByLink.settings.termsAndConditions.error.requirements.not.checked')}
                                </Typography>
                            </div>
                        )}
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
