import { isUndefined, uniqueId } from '../../../../../../utils';
import './TermsAndConditions.scss';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { h } from 'preact';
import { Checkbox } from '../../../../../internal/Checkbox';
import InputText from '../../../../../internal/FormFields/InputText';
import Typography from '../../../../../internal/Typography/Typography';
import Spinner from '../../../../../internal/Spinner';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { AlertTypeOption } from '../../../../../internal/Alert/types';
import Alert from '../../../../../internal/Alert/Alert';
import Icon from '../../../../../internal/Icon';
import { IPayByLinkTermsAndConditions } from '../../../../../../types';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';

const isValidURL = (termsAndConditionsURL: string) => {
    return termsAndConditionsURL === ''
        ? true
        : !termsAndConditionsURL
          ? false
          : termsAndConditionsURL.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
};

export const TermsAndConditions = ({ data, isFetching }: { data: IPayByLinkTermsAndConditions; isFetching: boolean }) => {
    const { i18n } = useCoreContext();

    const initialTermsAndConditionsURL = useRef<string | undefined>();
    const checkboxIdentifier = useRef(uniqueId());
    const [termsAndConditionsURL, setTermsAndConditionsURL] = useState<string | undefined>(data?.termsOfServiceUrl);
    const [isRequirementsChecked, setIsRequirementsChecked] = useState(false);
    const [isRequirementsCheckedByDefault, setIsRequirementsCheckedByDefault] = useState(data?.termsOfServiceUrl && data?.termsOfServiceUrl !== '');
    const [showNotCheckedRequirementsError, setShowNotCheckedRequirementsError] = useState(false);
    const [showInvalidURL, setShowInvalidURL] = useState(false);
    const [isTermsAndConditionsChanged, setIsTermsAndConditionsChanged] = useState(false);
    const { setPayload, saveActionCalled, getIsValid, setIsValid, setSaveActionCalled } = usePayByLinkSettingsContext();

    useEffect(() => {
        if (data?.termsOfServiceUrl) {
            initialTermsAndConditionsURL.current = data?.termsOfServiceUrl ?? '';
            setTermsAndConditionsURL(data?.termsOfServiceUrl ?? '');
        }
    }, [data]);

    useEffect(() => {
        if (saveActionCalled && getIsValid()) {
            if (!isUndefined(termsAndConditionsURL) && termsAndConditionsURL !== '') {
                setIsRequirementsCheckedByDefault(true);
                setIsRequirementsChecked(true);
            } else {
                setIsRequirementsCheckedByDefault(false);
                setIsRequirementsChecked(false);
            }
            initialTermsAndConditionsURL.current = termsAndConditionsURL;
            setIsTermsAndConditionsChanged(false);
            setSaveActionCalled(false);
        }
    }, [saveActionCalled, setSaveActionCalled, isTermsAndConditionsChanged, termsAndConditionsURL, setIsRequirementsChecked, getIsValid]);

    useEffect(() => {
        if (isRequirementsChecked || (termsAndConditionsURL && isValidURL(termsAndConditionsURL))) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }, [isRequirementsChecked, termsAndConditionsURL, setIsValid]);

    useEffect(() => {
        if (saveActionCalled) {
            if (termsAndConditionsURL && !isValidURL(termsAndConditionsURL)) {
                setShowInvalidURL(true);
            } else {
                setShowInvalidURL(false);
            }
            if (!isRequirementsChecked) {
                setShowNotCheckedRequirementsError(true);
            } else {
                setShowNotCheckedRequirementsError(false);
            }
            setSaveActionCalled(false);
        }
    }, [termsAndConditionsURL, isRequirementsChecked, showNotCheckedRequirementsError, saveActionCalled, setSaveActionCalled]);

    const onTermsAndConditionsURLInput = useCallback(
        (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
            e.preventDefault();
            setShowInvalidURL(false);
            if (!isUndefined(initialTermsAndConditionsURL.current) && initialTermsAndConditionsURL.current !== e?.currentTarget?.value) {
                setIsTermsAndConditionsChanged(true);
                if (isRequirementsCheckedByDefault) setIsRequirementsChecked(false);
                setIsRequirementsCheckedByDefault(false);
            }
            if (
                !isUndefined(initialTermsAndConditionsURL.current) &&
                initialTermsAndConditionsURL.current === e?.currentTarget?.value &&
                initialTermsAndConditionsURL.current !== ''
            ) {
                setIsTermsAndConditionsChanged(false);
                if (!isRequirementsCheckedByDefault) {
                    setIsRequirementsCheckedByDefault(true);
                }
            }
            setTermsAndConditionsURL(e?.currentTarget?.value);
            setPayload(e?.currentTarget?.value);
        },
        [setPayload, isRequirementsCheckedByDefault, setIsRequirementsCheckedByDefault, setIsRequirementsChecked]
    );

    const onCheckboxInput = useCallback((e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.currentTarget?.checked) setShowNotCheckedRequirementsError(false);
        setIsRequirementsChecked(e.currentTarget?.checked);
    }, []);

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
                            checked={Boolean(isRequirementsChecked || isRequirementsCheckedByDefault)}
                            disabled={Boolean(isRequirementsCheckedByDefault)}
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
                </>
            )}
        </section>
    );
};
