import { AdyenPlatformExperience, PayoutDetails, all_locales } from '../../../src';
import '../../utils/createPages';
import '../../assets/style/style.scss';
import sessionRequest from '../../utils/sessionRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { getDefaultID, getSearchParameters, TEST_CONFIG } from '../../utils/utils';

const DEFAULT_PAYOUT_DATE = '2024-06-09T00:00:00.000Z';
const DEFAULT_PAYOUT_ID = getDefaultID('1234567890123456');

const { id } = getSearchParameters();

const core = await AdyenPlatformExperience({
    availableTranslations: [all_locales],
    environment: 'test',
    async onSessionCreate() {
        return await sessionRequest();
    },
});

createLanguageButtons({ core });

const payoutDetailsComponent = new PayoutDetails({
    core,
    date: DEFAULT_PAYOUT_DATE,
    id: id ?? DEFAULT_PAYOUT_ID,
    onContactSupport: () => {},
    ...TEST_CONFIG,
});

payoutDetailsComponent.mount('.payout-details-component-container');
