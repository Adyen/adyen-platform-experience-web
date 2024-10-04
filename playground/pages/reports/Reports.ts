import { AdyenPlatformExperience, all_locales, ReportsOverview } from '../../../src';
import sessionRequest from '../../utils/sessionRequest';
import '../../utils/createPages';
import '../../assets/style/style.scss';

import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { TEST_CONFIG } from '../../utils/utils';

enableServerInMockedMode()
    .then(async () => {
        const core = await AdyenPlatformExperience({
            environment: 'test',
            availableTranslations: [all_locales],
            async onSessionCreate() {
                return await sessionRequest();
            },
        });

        createLanguageButtons({ core });

        const reportsComponent = new ReportsOverview({
            core,
            onFiltersChanged: (/* filters */) => {
                // do something here with the updated filters
            },
            onContactSupport: () => {},
            allowLimitSelection: true,
            preferredLimit: 10,
            ...TEST_CONFIG,
        });

        reportsComponent.mount('.reports-overview-container');
    })
    .catch(console.error);
