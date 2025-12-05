import Typography from '../../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import { Stepper } from '../../../../../internal/Stepper/Stepper';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { PBLFormValues, LinkCreationFormStep } from '../types';
import { CustomerDetailsForm } from '../Form/CustomerDetailsForm/CustomerDetailsForm';
import { PaymentDetailsForm } from '../Form/PaymentDetailsForm/PaymentDetailsForm';
import { FormSummary } from '../Form/Summary/FormSummary';
import { useWizardForm } from '../../../../../../hooks/form/wizard/useWizardForm';
import { WizardFormProvider } from '../../../../../../hooks/form/wizard/WizardFormContext';
import { ButtonVariant } from '../../../../../internal/Button/types';
import Button from '../../../../../internal/Button';
import '../../PayByLinkCreation.scss';
import { useFetch } from '../../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../../utils';
import './PayByLinkCreationForm.scss';
import useMutation from '../../../../../../hooks/useMutation/useMutation';
import { SuccessResponse } from '../../../../../../types/api/endpoints';
import { PaymentLinkConfiguration } from '../../../../../../types/api/models/payByLink';
import { getFormSteps } from '../../utils';
import { StoreForm } from '../Form/StoreForm/StoreForm';
import { TranslationKey } from '../../../../../../translations';
import Icon from '../../../../../internal/Icon';

type PayByLinkCreationFormContainerProps = {
    onPaymentLinkCreated?: (data: PBLFormValues & { paymentLink: SuccessResponse<'createPBLPaymentLink'> }) => void;
    storeIds?: string[] | string;
};

export const PayByLinkCreationFormContainer = ({ storeIds, onPaymentLinkCreated }: PayByLinkCreationFormContainerProps) => {
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [selectedStore, setSelectedStore] = useState<string>('');
    const { i18n } = useCoreContext();

    const { getPayByLinkConfiguration, createPBLPaymentLink, getPayByLinkSettings } = useConfigContext().endpoints;

    const configurationQuery = useFetch({
        fetchOptions: { enabled: !!getPayByLinkConfiguration && !!selectedStore },
        queryFn: useCallback(async () => {
            return getPayByLinkConfiguration?.(EMPTY_OBJECT, { path: { storeId: selectedStore } });
        }, [getPayByLinkConfiguration, selectedStore]),
    });

    const settingsQuery = useFetch({
        fetchOptions: { enabled: !!getPayByLinkSettings && !!selectedStore },
        queryFn: useCallback(async () => {
            return getPayByLinkSettings?.(EMPTY_OBJECT, { path: { storeId: selectedStore } });
        }, [getPayByLinkSettings, selectedStore]),
    });

    const getFieldConfig = useCallback(
        (field: keyof PaymentLinkConfiguration) => {
            return configurationQuery.data?.[field];
        },
        [configurationQuery.data]
    );

    const formSteps = useMemo(() => {
        return getFormSteps({ i18n, getFieldConfig });
    }, [configurationQuery.data, getFieldConfig, i18n]);

    const steps = useMemo(() => {
        return formSteps.map(step => ({
            id: step.id,
            label: i18n.get(`payByLink.linkCreation.form.steps.${step.id}` as TranslationKey),
        }));
    }, [formSteps, i18n]);

    const formStepsAriaLabel = useMemo(() => i18n.get('payByLink.linkCreation.steps.a11y.label'), [i18n]);

    const wizardForm = useWizardForm<PBLFormValues>({
        i18n,
        steps: formSteps,
        defaultValues: { store: selectedStore || '' },
        mode: 'all',
        validateBeforeNext: true,
    });

    useEffect(() => {
        const unsubscribe = wizardForm.control.subscribe(() => {
            const storeValue = wizardForm.control.getValue('store');
            if (storeValue && storeValue !== selectedStore) {
                setSelectedStore(storeValue);
            }
        });
        return unsubscribe;
    }, [wizardForm.control, selectedStore]);

    const { isLastStep, isFirstStep, currentStep, validateStep, canGoNext, isStepComplete, nextStep, previousStep, goToStep } = wizardForm;

    const handleNext = useCallback(
        async (index: number) => {
            if (!isLastStep) {
                await validateStep(index);
                await nextStep();
            }
        },
        [isLastStep, nextStep, validateStep]
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
        if (!data.countryCode || !data.amount?.currency || !data.amount?.value || !data.reference || !data.shopperName) {
            throw new Error('Missing required fields for payment link creation');
        }

        try {
            const result = await submitMutation.mutate(
                {
                    body: data,
                    contentType: 'application/json',
                },
                { path: { storeId: 'default' } }
            );

            onPaymentLinkCreated?.({ ...data, paymentLink: result });
        } catch (error) {
            console.error('Failed to create payment link:', error);
            throw error;
        }
    };

    const onError = (errors: any) => {
        // TODO - Define errorHandling
    };

    const [isSeparateAddress, setIsSeparateAddress] = useState<boolean>(false);

    // TODO - Define where to get timezone
    const timezone = undefined;

    const isNextStepLoading = submitMutation.isLoading || configurationQuery.isFetching || settingsQuery.isFetching;

    return (
        <div className="adyen-pe-pay-by-link-creation-form__component">
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
                {steps.map(step => (
                    <>{step.label}</>
                ))}
            </Stepper>
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
                            {(() => {
                                switch (currentFormStep) {
                                    case 'store':
                                        return (
                                            <StoreForm
                                                settingsQuery={settingsQuery}
                                                storeIds={storeIds}
                                                setNextButtonDisabled={setNextButtonDisabled}
                                            />
                                        );
                                    case 'payment':
                                        return <PaymentDetailsForm timezone={timezone} configuration={configurationQuery.data} />;
                                    case 'customer':
                                        return (
                                            <CustomerDetailsForm isSeparateAddress={isSeparateAddress} setIsSeparateAddress={setIsSeparateAddress} />
                                        );
                                    case 'summary':
                                        return <FormSummary />;
                                    default:
                                        return <PaymentDetailsForm configuration={configurationQuery.data} />;
                                }
                            })()}
                        </div>
                        <div className="adyen-pe-pay-by-link-creation-form__buttons-container">
                            <div className="adyen-pe-pay-by-link-creation-form__buttons">
                                <Button variant={ButtonVariant.SECONDARY} onClick={handlePrevious}>
                                    {isFirstStep
                                        ? i18n.get('payByLink.linkCreation.form.steps.cancel')
                                        : i18n.get('payByLink.linkCreation.form.steps.back')}
                                </Button>
                                <Button
                                    className="adyen-pe-pay-by-link-creation-form__submit-button"
                                    type={isLastStep ? 'submit' : 'button'}
                                    variant={ButtonVariant.PRIMARY}
                                    onClick={!isLastStep ? handleContinue : undefined}
                                    state={isNextStepLoading ? 'loading' : undefined}
                                    disabled={nextButtonDisabled}
                                    iconRight={<Icon name="arrow-right" />}
                                >
                                    {isLastStep
                                        ? i18n.get('payByLink.linkCreation.form.steps.submit')
                                        : i18n.get('payByLink.linkCreation.form.steps.continue')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </WizardFormProvider>
        </div>
    );
};
