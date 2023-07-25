import { getLegalEntityById } from '../../utils/services';
import { AdyenFP } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';

const DEFAULT_LEGAL_ENTITY_ID = 'LE322KH223222Q5J3VPCHFH82';

try {
    await enableServerInMockedMode();

    const adyenFP = await AdyenFP({ locale: 'en-US' });
    const data = await getLegalEntityById(DEFAULT_LEGAL_ENTITY_ID);
    adyenFP.create('legalEntityDetails', { legalEntity: data }).mount('.legal-entity-component-container');
} catch (e) {
    console.error(e);
}
