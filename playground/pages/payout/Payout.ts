import { AdyenPlatformExperience, PayoutDetails, all_locales } from '../../../src';
import { getDefaultID, getSearchParameters } from '../../utils/utils';
import '../../utils/createPages';
import '../../assets/style/style.scss';
import { enableServerInMockedMode } from '../../../mocks/mock-server/utils';
import sessionRequest from '../../utils/sessionRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';

const DEFAULT_PAYOUT_ID = getDefaultID('1234567890123456');

enableServerInMockedMode()
    .then(async () => {
        const { id } = getSearchParameters();

        const core = await AdyenPlatformExperience({
            environment: 'test',
            availableTranslations: [all_locales],
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        createLanguageButtons({ core });

        const payoutDetailsComponent = new PayoutDetails({
            core,
            id: id ?? DEFAULT_PAYOUT_ID,
            date: '2024-06-09T00:00:00.000Z',
            title: 'payoutDetails',
            onContactSupport: () => {},
        });

        payoutDetailsComponent.mount('.payout-details-component-container');
    })
    .catch(console.error);
