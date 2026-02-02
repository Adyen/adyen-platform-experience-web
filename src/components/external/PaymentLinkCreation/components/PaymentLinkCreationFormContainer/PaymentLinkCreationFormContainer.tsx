import Typography from '../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { Stepper } from '../../../../internal/Stepper/Stepper';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { PaymentLinkCreationFormValues, LinkCreationFormStep } from '../types';
import { WizardFormProvider } from '../../../../../hooks/form/wizard/WizardFormContext';
import { ButtonVariant } from '../../../../internal/Button/types';
import Button from '../../../../internal/Button';
import '../../PaymentLinkCreation.scss';
import './PaymentLinkCreationForm.scss';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { SuccessResponse } from '../../../../../types/api/endpoints';
import Icon from '../../../../internal/Icon';
import { usePaymentLinkFormData } from './usePaymentLinkFormData';
import { PaymentLinkCreationComponentProps } from '../../../../types';
import { scrollToFirstErrorField } from '../../utils';
import { useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { containerQueries } from '../../../../../hooks/useResponsiveContainer';
import { FormStepRenderer } from './FormStepRenderer';
import PaymentLinkSettingsContainer from '../../../PaymentLinkSettings/components/PaymentLinkSettingsContainer/PaymentLinkSettingsContainer';
import { StoreIds } from '../../../PaymentLinksOverview/types';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Alert from '../../../../internal/Alert/Alert';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { useInvalidFieldsConfig } from '../../hooks/useInvalidFieldsConfig';
import { AdyenErrorResponse } from '../../../../../core/Http/types';
import { Translation } from '../../../../internal/Translation';
import CopyText from '../../../../internal/CopyText/CopyText';

type PaymentLinkCreationFormContainerProps = {
    fieldsConfig?: PaymentLinkCreationComponentProps['fieldsConfig'];
    onCreationDismiss?: () => void;
    onPaymentLinkCreated?: (data: PaymentLinkCreationFormValues & { paymentLink: SuccessResponse<'createPBLPaymentLink'> }) => void;
    storeIds?: StoreIds;
    onContactSupport?: () => void;
    embeddedInOverview?: boolean;
};

const FIELD_LABEL_AND_MARGIN_OFFSET = 28;

const LoadingSkeleton = () => (
    <div className="adyen-pe-payment-link-creation-form__skeleton">
        <div className="adyen-pe-payment-link-creation-form__skeleton-item adyen-pe-payment-link-creation-form__skeleton-item--large" />
        {[...Array(3)].map((_, index) => (
            <>
                <div
                    key={`${index}-small`}
                    className="adyen-pe-payment-link-creation-form__skeleton-item adyen-pe-payment-link-creation-form__skeleton-item--small"
                />
                <div
                    key={`${index}-large`}
                    className="adyen-pe-payment-link-creation-form__skeleton-item adyen-pe-payment-link-creation-form__skeleton-item--large"
                />
            </>
        ))}
    </div>
);

export const PaymentLinkCreationFormContainer = ({
    fieldsConfig,
    storeIds,
    onCreationDismiss,
    onPaymentLinkCreated,
    onContactSupport,
    embeddedInOverview,
}: PaymentLinkCreationFormContainerProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [showFormValidationError, setShowFormValidationError] = useState<boolean>(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const hasPrefilledAddress = !!fieldsConfig?.data?.billingAddress || !!fieldsConfig?.data?.deliveryAddress;
    const [isSameAddress, setIsSameAddress] = useState<boolean>(!hasPrefilledAddress);
    const selectedStoreNavigationCache = useRef<string>('');
    const { i18n } = useCoreContext();
    const isXsAndDownContainer = useResponsiveContainer(containerQueries.down.xs);

    const {
        storesData,
        configurationData,
        countriesData,
        isFetchingCountries,
        countryDatasetData,
        isFetchingCountryDataset,
        settingsData,
        storesSelectorItems,
        termsAndConditionsProvisioned,
        formSteps,
        stepperItems,
        formStepsAriaLabel,
        wizardForm,
        createPaymentLink,
        isDataLoading,
        isFirstLoadDone,
        selectedStore,
        setSelectedStore,
    } = usePaymentLinkFormData({
        defaultValues: fieldsConfig?.data,
        storeIds,
    });

    const { isLastStep, isFirstStep, currentStep, validateStep, canGoNext, isStepComplete, nextStep, previousStep, goToStep } = wizardForm;
    const [showTermsAndConditions, setShowTermsAndConditions] = useState<boolean>(false);

    const handleNext = useCallback(
        async (index: number) => {
            if (!isLastStep) {
                const isValid = await validateStep(index);
                if (!isValid) {
                    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
                    const offsetTop = isXsAndDownContainer ? headerHeight + FIELD_LABEL_AND_MARGIN_OFFSET : FIELD_LABEL_AND_MARGIN_OFFSET;
                    scrollToFirstErrorField(Object.keys(wizardForm.formState.errors), offsetTop, formRef.current);
                    return;
                }
                await nextStep();
            }
        },
        [isLastStep, nextStep, validateStep, wizardForm.formState.errors, isXsAndDownContainer]
    );

    const onClickStep = useCallback(
        (index: number) => {
            void goToStep(index);
        },
        [goToStep]
    );

    const currentFormStep = useMemo<LinkCreationFormStep>(() => {
        const step = formSteps?.[currentStep];
        return step ? (step.id as LinkCreationFormStep) : 'store';
    }, [currentStep, formSteps]);

    const handlePrevious = () => {
        if (isFirstStep) {
            onCreationDismiss?.();
            return;
        }
        submitMutation.reset();
        previousStep();
    };

    const handleContinue = async () => {
        await handleNext(currentStep);
    };

    // Only called when the form is actually submitted (final step)
    const submitMutation = useMutation({
        queryFn: createPaymentLink,
    });

    const onSubmit = async (data: PaymentLinkCreationFormValues) => {
        const { store, ...dataWithoutStore } = data;

        try {
            const result = await submitMutation.mutate(
                {
                    body: dataWithoutStore,
                    contentType: 'application/json',
                },
                { path: { storeId: store } }
            );

            onPaymentLinkCreated?.({ ...data, paymentLink: result });
        } catch (error) {
            console.error('Failed to create payment link:', error);
            throw error;
        }
    };

    const navigateBackFromTermsAndConditions = useCallback(() => {
        setSelectedStore(selectedStoreNavigationCache.current);
        setShowTermsAndConditions(false);
        selectedStoreNavigationCache.current = '';
    }, [setShowTermsAndConditions, setSelectedStore]);

    const onError = (errors: any) => {
        // Form validation errors, should not happen since last step
        // (summary) does not include any validations
        setShowFormValidationError(true);
    };

    const isNextStepLoading = submitMutation.isLoading || isDataLoading;

    const accountIsMisconfigured = useMemo(() => {
        return storesData && storesData.data && storesData.data.length === 0;
    }, [storesData]);

    const displayConfigurationError = useMemo(() => {
        return currentFormStep !== 'store' && !configurationData;
    }, [configurationData, currentFormStep]);

    const nextButtonIsDisabled = useMemo(() => {
        return !termsAndConditionsProvisioned || accountIsMisconfigured || displayConfigurationError;
    }, [accountIsMisconfigured, displayConfigurationError, termsAndConditionsProvisioned]);

    const { invalidFieldsConfig } = useInvalidFieldsConfig();

    const getMappedInvalidFields = useCallback(
        (error: Error | AdyenErrorResponse | null) => {
            if (!error || !('invalidFields' in error) || !error.invalidFields?.length) return [];

            return error.invalidFields
                .map((field: { name: string; message: string }) => {
                    const fieldKey = invalidFieldsConfig.fields?.[field.name];
                    const messageKey = invalidFieldsConfig.messages?.[field.message];

                    if (!fieldKey && !messageKey) return null;

                    const fieldName = fieldKey ? i18n.get(fieldKey) : field.name;

                    if (!messageKey) return `${fieldName}`;

                    const message = i18n.get(messageKey);

                    return `${fieldName} (${message})`;
                })
                .filter((msg: string | null): msg is string => msg !== null);
        },
        [i18n, invalidFieldsConfig]
    );

    const onNavigateToTermsAndConditions = useCallback(() => {
        selectedStoreNavigationCache.current = selectedStore;
        setSelectedStore('');
        setShowTermsAndConditions(true);
    }, [selectedStore, setSelectedStore, setShowTermsAndConditions]);

    const getSubmitErrorLabel = useCallback(
        (error: Error | AdyenErrorResponse | null) => {
            if (getMappedInvalidFields(error).length) return i18n.get('payByLink.creation.form.alert.invalidFields');
            return i18n.get('payByLink.creation.form.alert.somethingWentWrong');
        },
        [getMappedInvalidFields, i18n]
    );

    const renderErrorDescription = useMemo(() => {
        const submitError = submitMutation.error as AdyenErrorResponse;
        const mappedErrors = getMappedInvalidFields(submitError);
        const hasInvalidFields = mappedErrors.length > 0;

        return (
            <div className="adyen-pe-payment-link-creation-form__error-alert">
                {hasInvalidFields && (
                    <ul className="adyen-pe-payment-link-creation-form__invalid-fields-error">
                        {mappedErrors.map((msg, idx) => (
                            <li key={idx}>
                                <Typography variant={TypographyVariant.CAPTION}>{msg}</Typography>
                            </li>
                        ))}
                    </ul>
                )}
                {onContactSupport && (
                    <div className="adyen-pe-payment-link-creation-form__contact-support">
                        <Translation
                            translationKey="payByLink.creation.form.error.submit.contactSupport"
                            fills={{
                                contactSupport: (
                                    <Button variant={ButtonVariant.TERTIARY} onClick={onContactSupport}>
                                        {i18n.get('common.actions.contactSupport.labels.reachOut')}
                                    </Button>
                                ),
                                errorCode: <CopyText stronger textToCopy={submitError?.requestId || submitError?.errorCode} />,
                            }}
                        />
                    </div>
                )}
            </div>
        );
    }, [getMappedInvalidFields, i18n, onContactSupport, submitMutation.error]);

    if (!isFirstLoadDone) {
        return (
            <div className="adyen-pe-payment-link-creation-form__component">
                <div className="adyen-pe-payment-link-creation-form__header">
                    <Typography variant={TypographyVariant.SUBTITLE} stronger>
                        {i18n.get('payByLink.creation.form.title')}
                    </Typography>
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    if (showTermsAndConditions) {
        return (
            <PaymentLinkSettingsContainer
                hideTitle={true}
                storeIds={selectedStoreNavigationCache.current}
                settingsItems={['termsAndConditions']}
                navigateBack={navigateBackFromTermsAndConditions}
                embeddedInOverview={embeddedInOverview}
            />
        );
    }

    return (
        <div className="adyen-pe-payment-link-creation-form__component">
            <div className="adyen-pe-payment-link-creation-form__header" ref={headerRef}>
                <Typography variant={TypographyVariant.SUBTITLE} stronger>
                    {i18n.get('payByLink.creation.form.title')}
                </Typography>
                <Stepper
                    nextStepDisabled={!canGoNext || !isStepComplete(currentStep)}
                    variant="horizontal"
                    activeIndex={currentStep}
                    ariaLabel={formStepsAriaLabel}
                    onChange={onClickStep}
                >
                    {stepperItems.map(item => (
                        <>{item.label}</>
                    ))}
                </Stepper>
            </div>
            <WizardFormProvider {...wizardForm}>
                <div className="adyen-pe-payment-link-creation-form__container">
                    <form
                        className="adyen-pe-payment-link-creation-form"
                        onSubmit={e => {
                            e.preventDefault();
                            wizardForm.handleSubmit(onSubmit, onError)(e);
                        }}
                        ref={formRef}
                    >
                        <div>
                            <FormStepRenderer
                                setShowTermsAndConditions={onNavigateToTermsAndConditions}
                                currentFormStep={currentFormStep}
                                settingsData={settingsData}
                                storeIds={storeIds}
                                storesData={storesData}
                                selectItems={storesSelectorItems}
                                termsAndConditionsProvisioned={termsAndConditionsProvisioned}
                                configurationData={configurationData}
                                isSameAddress={isSameAddress}
                                setIsSameAddress={setIsSameAddress}
                                countriesData={countriesData}
                                isFetchingCountries={isFetchingCountries}
                                countryDatasetData={countryDatasetData}
                                isFetchingCountryDataset={isFetchingCountryDataset}
                            />
                        </div>

                        {(displayConfigurationError || showFormValidationError) && (
                            <ErrorMessageDisplay
                                condensed
                                title={'common.errors.somethingWentWrong'}
                                withImage
                                absolutePosition={false}
                                outlined={false}
                                withBackground={false}
                                message={['payByLink.creation.errors.unavailable', 'common.errors.retry']}
                            />
                        )}
                        {accountIsMisconfigured && (
                            <Alert
                                type={AlertTypeOption.WARNING}
                                title={i18n.get('payByLink.common.errors.accountConfiguration')}
                                description={
                                    <div className="adyen-pe-payment-link-creation-form__warning-alert">
                                        <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN}>
                                            {i18n.get('common.errors.contactSupport')}
                                        </Typography>
                                        {onContactSupport ? (
                                            <Button variant={ButtonVariant.TERTIARY} onClick={onContactSupport}>
                                                {i18n.get('common.actions.contactSupport.labels.reachOut')}
                                            </Button>
                                        ) : null}
                                    </div>
                                }
                            />
                        )}
                        {submitMutation.isError && (
                            <Alert
                                type={AlertTypeOption.CRITICAL}
                                title={getSubmitErrorLabel(submitMutation.error)}
                                description={renderErrorDescription}
                            />
                        )}
                        <div className="adyen-pe-payment-link-creation-form__buttons-container">
                            {(!isFirstStep || onCreationDismiss) && (
                                <Button variant={ButtonVariant.SECONDARY} onClick={handlePrevious}>
                                    {i18n.get('payByLink.creation.form.steps.back')}
                                </Button>
                            )}
                            <Button
                                className="adyen-pe-payment-link-creation-form__submit-button"
                                type={isLastStep ? 'submit' : 'button'}
                                variant={ButtonVariant.PRIMARY}
                                onClick={!isLastStep ? handleContinue : undefined}
                                state={isNextStepLoading ? 'loading' : undefined}
                                disabled={nextButtonIsDisabled}
                                iconRight={<Icon name="arrow-right" />}
                            >
                                {isLastStep ? i18n.get('payByLink.creation.form.steps.submit') : i18n.get('payByLink.creation.form.steps.continue')}
                            </Button>
                        </div>
                    </form>
                </div>
            </WizardFormProvider>
        </div>
    );
};
