import { defineComponent, h } from 'vue';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';

/**
 * Visually hidden polite live region, to be paired with `useLiveAnnouncement`.
 * Screen readers announce `message` whenever it changes; sighted users never
 * see it. The element has to be in the DOM before the message changes, so it
 * renders even while the message is empty.
 */
export const LiveAnnouncement = defineComponent({
    name: 'LiveAnnouncement',

    props: {
        message: { type: String, default: '' },
    },

    setup: props => () => h('span', { 'aria-atomic': 'true', 'aria-live': 'polite', class: accessibilityStyles.visuallyHidden }, props.message),
});

export default LiveAnnouncement;
