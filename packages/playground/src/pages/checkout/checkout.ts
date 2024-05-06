import './style.scss';
import '../../utils/createPages.js';
import { initSession } from './session';

const initialize = initSession;

initialize().then(([checkout, dropin]) => {
    // @ts-ignore
    window.checkout = checkout;
    // @ts-ignore
    window.dropin = dropin;
});
