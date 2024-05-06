import AdyenCheckout from '@adyen/adyen-checkout';
import '@adyen/adyen-checkout/dist/adyen.css';
import { createSession } from './services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl } from './config/commonConfig';

export async function initSession() {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        telephoneNumber: '+611223344',
        shopperEmail: 'shopper.ctp1@adyen.com',
        countryCode,
        merchantAccount: 'TestMerchantCheckout',
    });

    const checkout = await AdyenCheckout({
        environment: 'test',
        clientKey: 'test_BGHOOLWXCBAP7KCIY3QKBLG5X43LWFKT',
        session,

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted: (result, component) => {
            console.info(result, component);
        },
        onError: (error, component) => {
            console.info(JSON.stringify(error), component);
        },
        // onChange: (state, component) => {
        //     console.log('onChange', state);
        // },
        paymentMethodsConfiguration: {
            paywithgoogle: {
                buttonType: 'plain',
            },
            card: {
                hasHolderName: true,
                holderNameRequired: true,
                holderName: 'J. Smith',
                positionHolderNameOnTop: true,

                // billingAddress config:
                billingAddressRequired: true,
                billingAddressMode: 'partial',
                _disableClickToPay: true,
            },
        },
    });

    const dropin = checkout
        .create('dropin', {
            instantPaymentTypes: ['googlepay'],
        })
        .mount('#dropin-container');
    return [checkout, dropin];
}
