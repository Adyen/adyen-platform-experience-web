import { AdyenPlatformExperience, TransactionsOverview } from '@adyen/adyen-platform-experience-web';
import { initServer } from '../../endpoints/mock-server/utils';
import getMySession from '../../utils/getMySession';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

const core = await AdyenPlatformExperience({
    onSessionCreate: async () => await getMySession(),
});

await initServer();

new TransactionsOverview({ core }).mount('.container');
