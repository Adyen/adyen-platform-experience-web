import { getLegalEntityById } from '../../utils/services';
import { AdyenFP, legalEntityDetails } from '@adyen/adyen-fp-web';
import '@adyen/adyen-fp-web/dist/adyen-fp-web.css';
import '../../../config/polyfills';
import '../../utils/utils';
import '../../assets/style/style.scss';

const DEFAULT_LEGAL_ENTITY_ID = 'LE322KH223222P5HPMP8B5VRF';
const MOCKED_LEGAL_ENTITY_ID = 'SE322LJ223222D5DNKVB65CMP';

(async () => {
    try {
        // const { id } = getSearchParameters();
        const adyenFP = await AdyenFP({ locale: 'en-US' });
        const data = await getLegalEntityById(process.env.MOCKED_MODE ? MOCKED_LEGAL_ENTITY_ID : DEFAULT_LEGAL_ENTITY_ID);
        adyenFP.create(legalEntityDetails, { legalEntity: data }).mount('.legal-entity-component-container');
    } catch (e) {
        console.error(e);
    }
})();
