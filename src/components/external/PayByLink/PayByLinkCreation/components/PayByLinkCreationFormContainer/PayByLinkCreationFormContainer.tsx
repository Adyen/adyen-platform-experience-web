import Typography from '../../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import { Stepper } from '../../../../../internal/Stepper/Stepper';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { PBLFormValues, LinkCreationFormStep } from '../types';
import { WizardFormProvider } from '../../../../../../hooks/form/wizard/WizardFormContext';
import { ButtonVariant } from '../../../../../internal/Button/types';
import Button from '../../../../../internal/Button';
import '../../PayByLinkCreation.scss';
import './PayByLinkCreationForm.scss';
import useMutation from '../../../../../../hooks/useMutation/useMutation';
import { SuccessResponse } from '../../../../../../types/api/endpoints';
import Icon from '../../../../../internal/Icon';
import { usePayByLinkFormData } from './usePayByLinkFormData';
import { PayByLinkCreationComponentProps } from '../../../../../types';
import { scrollToFirstErrorField } from '../../utils';
import { useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import { containerQueries } from '../../../../../../hooks/useResponsiveContainer';
import { FormStepRenderer } from './FormStepRenderer';

type PayByLinkCreationFormContainerProps = {
    fieldsConfig?: PayByLinkCreationComponentProps['fieldsConfig'];
    onCreationDismiss?: () => void;
    onPaymentLinkCreated?: (data: PBLFormValues & { paymentLink: SuccessResponse<'createPBLPaymentLink'> }) => void;
    storeIds?: string[] | string;
};

const LoadingSkeleton = () => (
    <div className="adyen-pe-pay-by-link-creation-form__skeleton">
        <div className="adyen-pe-pay-by-link-creation-form__skeleton-item adyen-pe-pay-by-link-creation-form__skeleton-item--large" />
        {[...Array(3)].map((_, index) => (
            <>
                <div
                    key={`${index}-small`}
                    className="adyen-pe-pay-by-link-creation-form__skeleton-item adyen-pe-pay-by-link-creation-form__skeleton-item--small"
                />
                <div
                    key={`${index}-large`}
                    className="adyen-pe-pay-by-link-creation-form__skeleton-item adyen-pe-pay-by-link-creation-form__skeleton-item--large"
                />
            </>
        ))}
    </div>
);

export const PayByLinkCreationFormContainer = ({
    fieldsConfig,
    storeIds,
    onCreationDismiss,
    onPaymentLinkCreated,
}: PayByLinkCreationFormContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasPrefilledBillingAddress = !!fieldsConfig?.data?.billingAddress;
    const [isSeparateAddress, setIsSeparateAddress] = useState<boolean>(hasPrefilledBillingAddress);
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
        createPBLPaymentLink,
        isDataLoading,
        isFirstLoadDone,
    } = usePayByLinkFormData({ defaultValues: fieldsConfig?.data, storeIds });

    const { isLastStep, isFirstStep, currentStep, validateStep, canGoNext, isStepComplete, nextStep, previousStep, goToStep } = wizardForm;

    const handleNext = useCallback(
        async (index: number) => {
            if (!isLastStep) {
                const isValid = await validateStep(index);
                if (!isValid && isXsAndDownContainer) {
                    scrollToFirstErrorField(Object.keys(wizardForm.formState.errors));
                    return;
                }
                await nextStep();
            }
        },
        [isLastStep, nextStep, validateStep, wizardForm.formState.errors, isXsAndDownContainer]
    );

    useEffect(() => {
        // Scroll to top of the form on each step change
        if (isXsAndDownContainer) {
            containerRef.current?.scrollIntoView({ block: 'start' });
        }
    }, [currentStep, isXsAndDownContainer]);

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
        previousStep();
    };

    const handleContinue = async () => {
        await handleNext(currentStep);
    };

    // Only called when the form is actually submitted (final step)
    const submitMutation = useMutation({
        queryFn: createPBLPaymentLink,
    });

    const onSubmit = async (data: PBLFormValues) => {
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

    const onError = (errors: any) => {
        console.log(errors);
        // TODO - Define errorHandling
    };

    // TODO - Define where to get timezone
    const timezone = undefined;

    const isNextStepLoading = submitMutation.isLoading || isDataLoading;

    if (!isFirstLoadDone) {
        return (
            <div className="adyen-pe-pay-by-link-creation-form__component">
                <div className="adyen-pe-pay-by-link-creation-form__header">
                    <Typography variant={TypographyVariant.SUBTITLE} stronger>
                        {i18n.get('payByLink.linkCreation.form.title')}
                    </Typography>
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="adyen-pe-pay-by-link-creation-form__component" ref={containerRef}>
            <div className="adyen-pe-pay-by-link-creation-form__header">
                <Typography variant={TypographyVariant.SUBTITLE} stronger>
                    {i18n.get('payByLink.linkCreation.form.title')}
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
                <div className="adyen-pe-pay-by-link-creation-form__container">
                    <form
                        className="adyen-pe-pay-by-link-creation-form"
                        onSubmit={e => {
                            e.preventDefault();
                            wizardForm.handleSubmit(onSubmit, onError)(e);
                        }}
                    >
                        <div>
                            <FormStepRenderer
                                currentFormStep={currentFormStep}
                                settingsData={settingsData}
                                storeIds={storeIds}
                                storesData={storesData}
                                selectItems={storesSelectorItems}
                                termsAndConditionsProvisioned={termsAndConditionsProvisioned}
                                timezone={timezone}
                                configurationData={configurationData}
                                isSeparateAddress={isSeparateAddress}
                                setIsSeparateAddress={setIsSeparateAddress}
                                countriesData={countriesData}
                                isFetchingCountries={isFetchingCountries}
                                countryDatasetData={countryDatasetData}
                                isFetchingCountryDataset={isFetchingCountryDataset}
                            />
                        </div>

                        <div className="adyen-pe-pay-by-link-creation-form__buttons-container">
                            {(!isFirstStep || onCreationDismiss) && (
                                <Button variant={ButtonVariant.SECONDARY} onClick={handlePrevious}>
                                    {i18n.get('payByLink.linkCreation.form.steps.back')}
                                </Button>
                            )}
                            <Button
                                className="adyen-pe-pay-by-link-creation-form__submit-button"
                                type={isLastStep ? 'submit' : 'button'}
                                variant={ButtonVariant.PRIMARY}
                                onClick={!isLastStep ? handleContinue : undefined}
                                state={isNextStepLoading ? 'loading' : undefined}
                                disabled={!termsAndConditionsProvisioned}
                                iconRight={<Icon name="arrow-right" />}
                            >
                                {isLastStep
                                    ? i18n.get('payByLink.linkCreation.form.steps.submit')
                                    : i18n.get('payByLink.linkCreation.form.steps.continue')}
                            </Button>
                        </div>
                    </form>
                </div>
            </WizardFormProvider>
        </div>
    );
};
