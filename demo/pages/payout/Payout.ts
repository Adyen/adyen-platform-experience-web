import { AdyenPlatformExperience, PayoutDetails, all_locales } from '@adyen/adyen-platform-experience-web';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

const DEFAULT_PAYOUT_DATE = '2024-11-20T10:00:00.000Z';
const DEFAULT_PAYOUT_ID = 'BA32CKZ223227T5L6834T3LBX';

const { id } = Object.fromEntries(new URLSearchParams(DEFAULT_PAYOUT_ID).entries());

const core = await AdyenPlatformExperience({
    availableTranslations: [all_locales],
    environment: 'test',
    async onSessionCreate() {
        return await sessionRequest();
    },
});

const payoutDetailsComponent = new PayoutDetails({
    core,
    date: DEFAULT_PAYOUT_DATE,
    id: id ?? DEFAULT_PAYOUT_ID,
    onContactSupport: () => {},
});

payoutDetailsComponent.mount('.payout-details-component-container');
