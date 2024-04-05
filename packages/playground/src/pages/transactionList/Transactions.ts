import { AdyenPlatformExperience, TransactionsOverview } from '@adyen/adyen-platform-experience-web';
import getMySession from '../../utils/getMySession';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

const core = await AdyenPlatformExperience({
    onSessionCreate: async () => await getMySession(),
});

new TransactionsOverview({ core }).mount('.container');
