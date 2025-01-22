import { AdyenPlatformExperience, all_locales, ReportsOverview } from '@adyen/adyen-platform-experience-web';
import sessionRequest from '../../utils/sessionRequest';
import '../../assets/style/reset.scss';
import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';

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
