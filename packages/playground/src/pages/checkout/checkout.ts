import './style.scss';
import '../../utils/createPages.js';
import { initSession } from './session';
import { createDarkTheme } from '../../utils/createLanguageButtons';

import '../../assets/style/style.scss';

const initialize = initSession;
createDarkTheme();
initialize().then(([checkout, dropin]) => {
    // @ts-ignore
    window.checkout = checkout;
    // @ts-ignore
    window.dropin = dropin;
});
