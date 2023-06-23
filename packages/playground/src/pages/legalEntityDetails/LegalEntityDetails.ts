import { getLegalEntityById } from '../../utils/services';
import { AdyenFP } from '@adyen/adyen-fp-web';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

const DEFAULT_LEGAL_ENTITY_ID = 'LE322KH223222P5HPMP8B5VRF';
const MOCKED_LEGAL_ENTITY_ID = 'SE322LJ223222D5DNKVB65CMP';

try {
    // const { id } = getSearchParameters();
    const adyenFP = await AdyenFP({ locale: 'en-US' });
    const data = await getLegalEntityById(MOCKED_LEGAL_ENTITY_ID);
    adyenFP.create('legalEntityDetails', { legalEntity: data }).mount('.legal-entity-component-container');
} catch (e) {
    console.error(e);
}
