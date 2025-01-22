import { enableServerInMockedMode } from '../../../mocks/mock-server/utils/utils';
import { AdyenPlatformExperience, all_locales, ReportsOverview } from '../../../src';
import sessionRequest from '../../utils/sessionRequest';
import '../../assets/style/reset.scss';

enableServerInMockedMode().then(async () => {
    const core = await AdyenPlatformExperience({
        environment: 'test',
        availableTranslations: [all_locales],
        async onSessionCreate() {
            return await sessionRequest();
        },
    });

    const reportsComponent = new ReportsOverview({
        core,
        onFiltersChanged: (/* filters */) => {
            // do something here with the updated filters
        },
        onContactSupport: () => {},
        allowLimitSelection: true,
        preferredLimit: 10,
    });

    reportsComponent.mount('.reports-overview-container');
});
