import { _UIComponentProps, PayByLinkCreationComponentProps } from '../../../../../types';
import Typography from '../../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
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

const PayByLinkCreationContainer = (props: _UIComponentProps<PayByLinkCreationComponentProps>) => {
    const { i18n } = useCoreContext();

    const { getPayByLinkConfiguration: payByLinkConfigurationEndpointCall } = useConfigContext().endpoints;

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
                        { fieldName: 'store', required: true, visible: !!configurationQuery.data?.['store'] },
                        { fieldName: 'linkValidity', required: true, visible: !!configurationQuery.data?.['linkValidity'] },
                        { fieldName: 'amountValue', required: true, visible: !!configurationQuery.data?.['amountValue'] },
                        { fieldName: 'currency', required: true, visible: !!configurationQuery.data?.['currency'] },
                        { fieldName: 'merchantReference', required: true, visible: !!configurationQuery.data?.['merchantReference'] },
                        { fieldName: 'linkType', required: true, visible: !!configurationQuery.data?.['linkType'] },
                        { fieldName: 'description', required: true, visible: !!configurationQuery.data?.['description'] },
                        { fieldName: 'deliveryDate', required: true, visible: !!configurationQuery.data?.['deliveryDate'] },
                    ] as const
                ).filter(field => !!configurationQuery.data?.[field.fieldName]),
                isOptional: false,
            },
            {
                id: 'customer',
                title: i18n.get('payByLink.linkCreation.customerDetailsForm.title'),
                description: i18n.get('payByLink.linkCreation.customerDetailsForm.description'),
                fields: (
                    [
                        { fieldName: 'shopperReference', required: true, visible: !!configurationQuery.data?.['shopperReference'] },
                        { fieldName: 'fullName', required: true, visible: !!configurationQuery.data?.['fullName'] },
                        { fieldName: 'emailAddress', required: true, visible: !!configurationQuery.data?.['emailAddress'] },
                        { fieldName: 'emailAddress', required: true, visible: !!configurationQuery.data?.['emailAddress'] },
                        { fieldName: 'sendLinkToShopper', required: true, visible: !!configurationQuery.data?.['sendLinkToShopper'] },
                        {
                            fieldName: 'sendPaymentSuccessToShopper',
                            required: true,
                            visible: !!configurationQuery.data?.['sendPaymentSuccessToShopper'],
                        },
                        { fieldName: 'emailSender', required: true, visible: !!configurationQuery.data?.['emailSender'] },
                        { fieldName: 'phoneNumber', required: true, visible: !!configurationQuery.data?.['phoneNumber'] },
                        { fieldName: 'countryCode', required: true, visible: !!configurationQuery.data?.['countryCode'] },
                        { fieldName: 'shippingAddress', required: true, visible: !!configurationQuery.data?.['shippingAddress'] },
                        { fieldName: 'billingAddress', required: true, visible: !!configurationQuery.data?.['billingAddress'] },
                        { fieldName: 'shopperLocale', required: true, visible: !!configurationQuery.data?.['shopperLocale'] },
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

    const { isLastStep, isFirstStep, currentStep, validateStep, canGoNext, isStepComplete, nextStep, previousStep, goToStep, currentStepConfig } =
        wizardForm;

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
    const onSubmit = async (data: FormValues) => {
        // TODO: Send data to API
        console.log(data);
    };

    const onError = (errors: any) => {
        // TODO - Define errorHandling
    };

    const [isSeparateAddress, setIsSeparateAddress] = useState<boolean>(false);

    // TODO - Define where to get timezone
    const timezone = undefined;

    return (
        <div className="adyen-pe-pay-by-link-creation">
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
                <div className="adyen-pe-pay-by-link-creation__form-container">
                    <div className="adyen-pe-pay-by-link-creation__title-container">
                        <Typography variant={TypographyVariant.TITLE} el={TypographyElement.H2} className="adyen-pe-pay-by-link-creation__form-title">
                            {currentStepConfig.title}
                        </Typography>
                        <Typography
                            variant={TypographyVariant.BODY}
                            el={TypographyElement.SPAN}
                            className="adyen-pe-pay-by-link-creation__form-description"
                        >
                            {currentStepConfig.description}
                        </Typography>
                    </div>
                    <form
                        className="adyen-pe-pay-by-link-creation__form"
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
                        <div className="adyen-pe-pay-by-link-creation__form-buttons-container">
                            <div className="adyen-pe-pay-by-link-creation__buttons">
                                <Button variant={ButtonVariant.SECONDARY} onClick={handlePrevious}>
                                    {isFirstStep
                                        ? i18n.get('payByLink.linkCreation.form.steps.cancel')
                                        : i18n.get('payByLink.linkCreation.form.steps.back')}
                                </Button>
                                <Button
                                    className="adyen-pe-pay-by-link-creation__submit-button"
                                    type={isLastStep ? 'submit' : 'button'}
                                    variant={ButtonVariant.PRIMARY}
                                    onClick={!isLastStep ? handleContinue : undefined}
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

export default PayByLinkCreationContainer;
