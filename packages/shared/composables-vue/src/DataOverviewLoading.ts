import { defineComponent, h } from 'vue';
import { BentoLoadingIndicator } from '@adyen/bento-vue3';
import styles from './DataOverviewLoading.module.scss';

/**
 * Centered loading state that stands in for a data grid while its records load.
 * The Bento spinner is decorative (aria-hidden), so the wrapper carries aria-busy.
 */
export const DataOverviewLoading = defineComponent({
    name: 'DataOverviewLoading',

    setup() {
        return () => h('div', { class: styles.loading, 'aria-busy': 'true' }, [h(BentoLoadingIndicator, { large: true })]);
    },
});

export default DataOverviewLoading;
