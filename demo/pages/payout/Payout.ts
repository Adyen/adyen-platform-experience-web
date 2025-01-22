import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { AdyenPlatformExperience, PayoutDetails, all_locales } from '../../../src';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';

const DEFAULT_PAYOUT_DATE = '2025-01-20T10:00:00.000Z';
const DEFAULT_PAYOUT_ID = 'BA32272223222B5CTDQPM6W2G';

enableServerInMockedMode()
    .then(async () => {
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
    })
    .catch(console.error);
