import { AdyenFP } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

const DEFAULT_LEGAL_ENTITY_ID = 'LE322KH223222Q5J3VPCHFH82';

try {
    await enableServerInMockedMode();

    const adyenFP = await AdyenFP({ locale: 'en-US', loadingContext: process.env.VITE_API_URL });
    adyenFP.create('legalEntityDetails', { legalEntityId: DEFAULT_LEGAL_ENTITY_ID }).mount('.legal-entity-component-container');
} catch (e) {
    console.error(e);
}
