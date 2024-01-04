import { AdyenFP, AccountHolderComponent, es_ES } from '@adyen/adyen-fp-web';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

const DEFAULT_ACCOUNT_HOLDER = getDefaultID('AH3227B2248HKJ5BHTQPKC5GX');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();
        const adyenFP = await AdyenFP({ locale: 'es-ES', availableTranslations: [es_ES] });

        const accountHolderComponent = new AccountHolderComponent({ core: adyenFP, accountHolderId: id ?? DEFAULT_ACCOUNT_HOLDER });

        accountHolderComponent.mount('.account-holder-component-container');
    })
    .catch(console.error);
