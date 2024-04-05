// import _ from '../../utils/_';
// import '../../utils/createPages.js';
// import '../../assets/style/style.scss';
import { AdyenPlatformExperience, TransactionDetails } from '@adyen/adyen-platform-experience-web';
import getMySession from '../../utils/getMySession';
import '../../utils/createPages.js';
import '../../assets/style/style.scss';

const id = window.URLSearchParams.get('id');

const core = await AdyenPlatformExperience({
    onSessionCreate: async () => await getMySession(),
});

new TransactionDetails({
    core,
    id,
}).mount('.container');
