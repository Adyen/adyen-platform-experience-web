import { AdyenPlatformExperience, TransactionsOverview } from '@adyen/adyen-platform-experience-web';
import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';

import getMySession from '../../utils/getMySession';
import '../../assets/style/style.scss';

const core = await AdyenPlatformExperience({
    onSessionCreate: getMySession,
});

new TransactionsOverview({ core }).mount('.container');
