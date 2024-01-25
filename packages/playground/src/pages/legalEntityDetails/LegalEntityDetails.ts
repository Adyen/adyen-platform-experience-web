import { AdyenFP, LegalEntityComponent } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../endpoints/mock-server/utils';
import { getDefaultID } from '../../utils/utils';

const DEFAULT_LEGAL_ENTITY_ID = getDefaultID('LE322KH223222Q5J3VPCHFH82');

enableServerInMockedMode()
    .then(async () => {
        const adyenFP = await AdyenFP({ locale: 'en-US' });
        const legalEntityComponent = new LegalEntityComponent({ legalEntityId: DEFAULT_LEGAL_ENTITY_ID, core: adyenFP });

        legalEntityComponent.mount('.legal-entity-component-container');
    })
    .catch(console.error);
