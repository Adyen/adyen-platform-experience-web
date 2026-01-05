import { uniqueId } from '../../../../../../utils';
import './TermsAndConditions.scss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { h } from 'preact';
import { Checkbox } from '../../../../../internal/Checkbox';
import InputText from '../../../../../internal/FormFields/InputText';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { AlertTypeOption } from '../../../../../internal/Alert/types';
import Alert from '../../../../../internal/Alert/Alert';
import Icon from '../../../../../internal/Icon';
import { IPayByLinkTermsAndConditions } from '../../../../../../types';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';
import { isTermsAndConditionsData } from '../PayByLinkThemeContainer/types';
import { Translation } from '../../../../../internal/Translation';
import { isValidURL } from '../PayByLinkSettingsContainer/utils/validateTermsAndConditionsURL';
import { ButtonVariant } from '../../../../../internal/Button/types';
import Button from '../../../../../internal/Button';
import { Requirements } from './Requirements/Requirements';
import cx from 'classnames';

export const TermsAndConditions = ({ data, initialData }: { data: IPayByLinkTermsAndConditions; initialData: IPayByLinkTermsAndConditions }) => {
    const { i18n } = useCoreContext();
    const checkboxIdentifier = useRef(uniqueId());
    const [termsAndConditionsURL, setTermsAndConditionsURL] = useState<string>(data?.termsOfServiceUrl ?? '');
    const [isRequirementsChecked, setIsRequirementsChecked] = useState<boolean | undefined>(undefined);
    const [showNotCheckedRequirementsError, setShowNotCheckedRequirementsError] = useState(false);
    const [showInvalidURL, setShowInvalidURL] = useState(false);
    const [isTermsAndConditionsChanged, setIsTermsAndConditionsChanged] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const userRequirementsInput = useRef(false);
    const {
        savedData,
        setPayload,
        saveActionCalled,
        setIsValid,
        isSaving,
        setSaveActionCalled,
        setIsSaveError,
        setIsSaveSuccess,
        isShowingRequirements,
        embeddedInOverview,
        setIsShowingRequirements,
    } = usePayByLinkSettingsContext();

    useEffect(() => {
        if (isRequirementsChecked && isValidURL(termsAndConditionsURL)) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }, [isRequirementsChecked, termsAndConditionsURL, setIsValid, setPayload]);

    useEffect(() => {
        userRequirementsInput.current = false;
    }, [savedData]);

    useEffect(() => {
        if (saveActionCalled) {
            setShowInvalidURL(Boolean(termsAndConditionsURL && !isValidURL(termsAndConditionsURL)));
            setShowNotCheckedRequirementsError(!isRequirementsChecked);
            setSaveActionCalled(false);
            setIsSaveSuccess(false);
            setIsSaveError(false);
        }
    }, [termsAndConditionsURL, isRequirementsChecked, saveActionCalled, setSaveActionCalled, setPayload, setIsSaveError, setIsSaveSuccess]);

    useEffect(() => {
        let data = isTermsAndConditionsData(savedData) ? (savedData as IPayByLinkTermsAndConditions) : undefined;
        if (!data) data = initialData;
        const hasEmptyInitialValue = !data || !data.termsOfServiceUrl;
        const isSameWithInitialValue =
            data && (data?.termsOfServiceUrl === termsAndConditionsURL || (!data.termsOfServiceUrl && termsAndConditionsURL === ''));
        if (isSameWithInitialValue) {
            if (!hasEmptyInitialValue) {
                setDisabled(true);
                setIsRequirementsChecked(true);
            }
            setIsTermsAndConditionsChanged(false);
        } else {
            setDisabled(false);
            setIsTermsAndConditionsChanged(true);
            setIsRequirementsChecked(userRequirementsInput.current);
        }
    }, [termsAndConditionsURL, savedData, initialData]);

    const onTermsAndConditionsURLInput = useCallback(
        (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
            e.preventDefault();
            setShowInvalidURL(false);
            setTermsAndConditionsURL(e?.currentTarget?.value);
            if (isValidURL(e?.currentTarget?.value)) {
                setPayload({ termsOfServiceUrl: e?.currentTarget?.value });
            }
        },
        [setPayload]
    );

    const onCheckboxInput = useCallback(
        (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
            e.preventDefault();
            if (e.currentTarget?.checked) setShowNotCheckedRequirementsError(false);
            userRequirementsInput.current = e.currentTarget?.checked;
            setIsRequirementsChecked(e.currentTarget?.checked);
        },
        [userRequirementsInput]
    );

    const openRequirements = useCallback(() => {
        setIsShowingRequirements(true);
    }, []);

    const checkboxLabel = useMemo(() => {
        return (
            <Translation
                translationKey={'payByLink.settings.termsAndConditions.requirement.checkbox.part1'}
                fills={{
                    requirements: (
                        <Button
                            className="adyen-pe-pay-by-link-settings-terms-and-conditions__requirements-link"
                            variant={ButtonVariant.TERTIARY}
                            onClick={openRequirements}
                        >
                            {i18n.get('payByLink.settings.termsAndConditions.requirement.checkbox.part2')}
                        </Button>
                    ),
                }}
            />
        );
    }, [i18n, openRequirements]);

    const closeModal = useCallback(() => setIsShowingRequirements(false), []);

    const acceptRequirements = useCallback(() => setIsRequirementsChecked(true), []);

    return (
        <section className="adyen-pe-pay-by-link-settings-terms-and-conditions">
            <div
                className={cx('adyen-pe-pay-by-link-settings-terms-and-conditions__content', {
                    'adyen-pe-pay-by-link-settings-terms-and-conditions__content--hidden': isShowingRequirements,
                })}
            >
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
                    <InputText
                        disabled={isSaving}
                        uniqueId={checkboxIdentifier.current}
                        value={termsAndConditionsURL}
                        onInput={onTermsAndConditionsURLInput}
                        maxLength={2000}
                        isInvalid={showInvalidURL}
                    />
                    {showInvalidURL && (
                        <div className="adyen-pe-pay-by-link-settings-terms-and-conditions__error">
                            <Icon name="cross-circle-fill" className={'adyen-pe-pay-by-link-settings-terms-and-conditions__error-icon'} />
                            <Typography
                                className={'adyen-pe-pay-by-link-settings-terms-and-conditions__error-text'}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.BODY}
                            >
                                {i18n.get('payByLink.settings.termsAndConditions.error.urlValidation')}
                            </Typography>
                        </div>
                    )}
                </div>
                {isTermsAndConditionsChanged && (
                    <Alert
                        type={AlertTypeOption.WARNING}
                        description={i18n.get('payByLink.settings.termsAndConditions.alert.urlChange')}
                        className={'adyen-pe-pay-by-link-settings-terms-and-conditions__alert'}
                    />
                )}
                <div className="adyen-pe-pay-by-link-settings-terms-and-conditions-checkbox__container">
                    <Checkbox
                        checked={isRequirementsChecked}
                        disabled={disabled || isSaving}
                        className={'adyen-pe-pay-by-link-settings-terms-and-conditions-checkbox'}
                        label={checkboxLabel}
                        onInput={onCheckboxInput}
                        error={showNotCheckedRequirementsError}
                    />
                    {showNotCheckedRequirementsError && (
                        <div className="adyen-pe-pay-by-link-settings-terms-and-conditions__error">
                            <Icon name="cross-circle-fill" className={'adyen-pe-pay-by-link-settings-terms-and-conditions__error-icon'} />
                            <Typography
                                className={'adyen-pe-pay-by-link-settings-terms-and-conditions__error-text'}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.BODY}
                            >
                                {i18n.get('payByLink.settings.termsAndConditions.error.requirementsNotChecked')}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
            {isShowingRequirements && (
                <Requirements
                    onGoBack={closeModal}
                    termsAndConditionsURL={termsAndConditionsURL}
                    acceptRequirements={acceptRequirements}
                    embeddedInOverview={embeddedInOverview}
                />
            )}
        </section>
    );
};
