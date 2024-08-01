import { AdyenPlatformExperience, TransactionsOverview, all_locales } from '../../../src';
import '../../utils/createPages';
import '../../assets/style/style.scss';
import sessionRequest from '../../utils/sessionRequest';
import { createLanguageButtons } from '../../utils/createLanguageButtons';
import { TEST_CONFIG } from '../../utils/utils';

const core = await AdyenPlatformExperience({
    availableTranslations: [all_locales],
    environment: 'test',
    async onSessionCreate() {
        return await sessionRequest();
    },
});

createLanguageButtons({ core });

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
    ...TEST_CONFIG,
});

transactionsComponent.mount('.transactions-component-container');
