import Typography from '../../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import { Stepper } from '../../../../../internal/Stepper/Stepper';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { FormValues, LinkCreationFormStep } from '../types';
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

type PayByLinkCreationFormContainerProps = {
    onSubmitted?: (result: SuccessResponse<'createPayByLinkConfiguration'>) => void;
};

export const PayByLinkCreationFormContainer = ({ onSubmitted }: PayByLinkCreationFormContainerProps) => {
    const { i18n } = useCoreContext();

    const { getPayByLinkConfiguration: payByLinkConfigurationEndpointCall, createPayByLinkConfiguration } = useConfigContext().endpoints;

    const configurationQuery = useFetch({
        fetchOptions: { enabled: !!payByLinkConfigurationEndpointCall },
        queryFn: useCallback(async () => {
            return payByLinkConfigurationEndpointCall?.(EMPTY_OBJECT);
        }, [payByLinkConfigurationEndpointCall]),
    });

    const steps = useMemo(() => {
        return [
            { id: 'Payment', label: i18n.get('payByLink.linkCreation.form.steps.payment') },
            { id: 'Customer', label: i18n.get('payByLink.linkCreation.form.steps.customer') },
            { id: 'Summary', label: i18n.get('payByLink.linkCreation.form.steps.summary') },
        ];
    }, [i18n]);

    const formStepsAriaLabel = useMemo(() => i18n.get('payByLink.linkCreation.steps.a11y.label'), [i18n]);

    const formSteps = useMemo(() => {
        return [
            {
                id: 'payment',
                title: i18n.get('payByLink.linkCreation.paymentDetailsForm.title'),
                description: i18n.get('payByLink.linkCreation.paymentDetailsForm.description'),
                fields: (
                    [
                        {
                            fieldName: 'store',
                            required: true,
                            visible: !!configurationQuery.data?.['store'],
                            label: 'payByLink.creation.summary.fields.store',
                        },
                        {
                            fieldName: 'linkValidity',
                            required: true,
                            visible: !!configurationQuery.data?.['linkValidity'],
                            label: 'payByLink.creation.summary.fields.linkValidity',
                        },
                        {
                            fieldName: 'amountValue',
                            required: true,
                            visible: !!configurationQuery.data?.['amountValue'],
                            label: 'payByLink.creation.summary.fields.amountValue',
                        },
                        {
                            fieldName: 'currency',
                            required: true,
                            visible: !!configurationQuery.data?.['currency'],
                            label: 'payByLink.creation.summary.fields.currency',
                        },
                        {
                            fieldName: 'merchantReference',
                            required: true,
                            visible: !!configurationQuery.data?.['merchantReference'],
                            label: 'payByLink.creation.summary.fields.merchantReference',
                        },
                        {
                            fieldName: 'linkType',
                            required: true,
                            visible: !!configurationQuery.data?.['linkType'],
                            label: 'payByLink.creation.summary.fields.linkType',
                        },
                        {
                            fieldName: 'description',
                            required: true,
                            visible: !!configurationQuery.data?.['description'],
                            label: 'payByLink.creation.summary.fields.description',
                        },
                        {
                            fieldName: 'deliveryDate',
                            required: true,
                            visible: !!configurationQuery.data?.['deliveryDate'],
                        },
                    ] as const
                ).filter(field => !!configurationQuery.data?.[field.fieldName]),
                isOptional: false,
            },
            {
                id: 'customer',
                fields: (
                    [
                        {
                            fieldName: 'shopperReference',
                            required: true,
                            visible: !!configurationQuery.data?.['shopperReference'],
                            label: 'payByLink.creation.summary.fields.shopperReference',
                        },
                        {
                            fieldName: 'fullName',
                            required: true,
                            visible: !!configurationQuery.data?.['fullName'],
                            label: 'payByLink.creation.summary.fields.fullName',
                        },
                        {
                            fieldName: 'emailAddress',
                            required: true,
                            visible: !!configurationQuery.data?.['emailAddress'],
                            label: 'payByLink.creation.summary.fields.emailAddress',
                        },
                        {
                            fieldName: 'sendLinkToShopper',
                            required: true,
                            visible: !!configurationQuery.data?.['sendLinkToShopper'],
                        },
                        {
                            fieldName: 'sendPaymentSuccessToShopper',
                            required: true,
                            visible: !!configurationQuery.data?.['sendPaymentSuccessToShopper'],
                        },
                        {
                            fieldName: 'emailSender',
                            required: true,
                            visible: !!configurationQuery.data?.['emailSender'],
                            label: 'payByLink.creation.summary.fields.emailAddress',
                        },
                        {
                            fieldName: 'phoneNumber',
                            required: true,
                            visible: !!configurationQuery.data?.['phoneNumber'],
                            label: 'payByLink.creation.summary.fields.phoneNumber',
                        },
                        {
                            fieldName: 'countryCode',
                            required: true,
                            visible: !!configurationQuery.data?.['countryCode'],
                            label: 'payByLink.creation.summary.fields.countryCode',
                        },
                        {
                            fieldName: 'shippingAddress',
                            required: true,
                            visible: !!configurationQuery.data?.['shippingAddress'],
                            label: 'payByLink.creation.summary.fields.shippingAddress',
                        },
                        {
                            fieldName: 'billingAddress',
                            required: true,
                            visible: !!configurationQuery.data?.['billingAddress'],
                            label: 'payByLink.creation.summary.fields.billingAddress',
                        },
                        {
                            fieldName: 'shopperLocale',
                            required: true,
                            visible: !!configurationQuery.data?.['shopperLocale'],
                        },
                    ] as const
                ).filter(field => !!configurationQuery.data?.[field.fieldName]),
                isOptional: false,
            },
            {
                id: 'summary',
                title: i18n.get('payByLink.linkCreation.form.steps.customer'),
                fields: [],
                isOptional: true,
            },
        ] as const;
    }, [configurationQuery.data, i18n]);

    const wizardForm = useWizardForm<FormValues>({
        steps: formSteps,
        defaultValues: {},
        mode: 'all',
        validateBeforeNext: true,
    });

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
        switch (currentStep) {
            case 0:
                return 'Payment';
            case 1:
                return 'Customer';
            case 2:
                return 'Summary';
            default:
                return 'Payment';
        }
    }, [currentStep]);

    const handlePrevious = () => {
        previousStep();
    };

    const handleContinue = async () => {
        await handleNext(currentStep);
    };

    // Only called when the form is actually submitted (final step)
    const submitMutation = useMutation({
        queryFn: createPayByLinkConfiguration,
        options: {
            onSuccess: data => {
                onSubmitted?.(data);
            },
        },
    });

    const onSubmit = async (data: FormValues) => {
        await submitMutation.mutate({ body: data, contentType: 'application/json' });
    };

    const onError = (errors: any) => {
        // TODO - Define errorHandling
    };

    const [isSeparateAddress, setIsSeparateAddress] = useState<boolean>(false);

    // TODO - Define where to get timezone
    const timezone = undefined;

    return (
        <div className="adyen-pe-pay-by-link-creation-form">
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
                <div className="adyen-pe-pay-by-link-creation-form__form-container">
                    <form
                        className="adyen-pe-pay-by-link-creation-form__form"
                        onSubmit={e => {
                            e.preventDefault();
                            wizardForm.handleSubmit(onSubmit, onError)(e);
                        }}
                    >
                        <div>
                            {(() => {
                                switch (currentFormStep) {
                                    case 'Payment':
                                        return (
                                            <PaymentDetailsForm
                                                timezone={timezone}
                                                configuration={configurationQuery.data}
                                                isConfigLoading={configurationQuery.isFetching}
                                            />
                                        );
                                    case 'Customer':
                                        return (
                                            <CustomerDetailsForm isSeparateAddress={isSeparateAddress} setIsSeparateAddress={setIsSeparateAddress} />
                                        );
                                    case 'Summary':
                                        return <FormSummary />;
                                    default:
                                        return (
                                            <PaymentDetailsForm
                                                configuration={configurationQuery.data}
                                                isConfigLoading={configurationQuery.isFetching}
                                            />
                                        );
                                }
                            })()}
                        </div>
                        <div className="adyen-pe-pay-by-link-creation-form__form-buttons-container">
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
                                    state={submitMutation.isLoading ? 'loading' : undefined}
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
