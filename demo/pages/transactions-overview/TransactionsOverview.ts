import { AdyenPlatformExperience, TransactionsOverview, all_locales } from '@adyen/adyen-platform-experience-web';
import '../../assets/style/reset.scss';
import sessionRequest from '../../utils/sessionRequest';
import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';

const core = await AdyenPlatformExperience({
    availableTranslations: [all_locales],
    environment: 'test',
    async onSessionCreate() {
        return await sessionRequest();
    },
});

const transactionsComponent = new TransactionsOverview({
    core,
    allowLimitSelection: true,
    onContactSupport: () => {},
    onFiltersChanged: (/* filters */) => {
        // do something here with the updated filters
    },
    onRecordSelection: ({ showModal }) => {
        showModal();
        // window.location.assign(`/src/pages/transaction/?id=${id}`);
    },
    preferredLimit: 10,
});

transactionsComponent.mount('.transactions-component-container');
