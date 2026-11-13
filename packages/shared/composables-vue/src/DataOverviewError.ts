import { computed, defineComponent, h, type Component, type PropType, type VNode } from 'vue';
import { BentoButtonActions, BentoEmptyState, type BentoButtonActionsList } from '@adyen/bento-vue3';
import ErrorIcon from '@adyen/ui-assets-icons-24/vue/cross-circle';
import HighlightIcon from '@adyen/ui-assets-icons-24/vue/info';
import Search from '@adyen/ui-assets-icons-24/vue/search';
import { getSafeDomainTranslationKey, useCoreContext, type ErrorMessageInfo, useConfigContext } from '@integration-components/core/vue';
import { useLiveAnnouncement } from './useLiveAnnouncement';
import { LiveAnnouncement } from './LiveAnnouncement';
import styles from './DataOverviewError.module.scss';

type DataErrorType = 'highlight' | 'error' | 'no-results-found';

const ICON_BY_TYPE: Record<DataErrorType, Component> = {
    highlight: HighlightIcon,
    error: ErrorIcon,
    'no-results-found': Search,
};

export const DataOverviewError = defineComponent({
    name: 'DataOverviewError',

    props: {
        actions: { type: Array as PropType<BentoButtonActionsList>, default: undefined },
        errorInfo: { type: Object as PropType<ErrorMessageInfo>, required: true },
        type: { type: String as PropType<DataErrorType>, default: 'error' },
        variant: { type: String as PropType<'basic' | 'condensed' | 'embedded'>, default: 'basic' },
        refreshIcon: { type: [Object, Function] as PropType<Component>, default: undefined },
        /**
         * Re-fetches the data the error state belongs to. Falls back to remounting the component, which resets its filters.
         * A config/session error also forces the remount fallback, so the session can be re-established.
         */
        onRefresh: { type: Function as PropType<(() => void) | undefined>, default: undefined },
    },

    setup(props) {
        const { i18n, refreshComponent: refreshCurrentComponent, translationDomain } = useCoreContext();
        const configContext = useConfigContext();
        const { announcement } = useLiveAnnouncement();

        const iconComponent = computed(() => ICON_BY_TYPE[props.type]);
        const iconClass = computed(() => (props.type === 'error' ? styles.iconCritical : undefined));
        const errorInfo = computed(() => props.errorInfo);

        const title = computed(() => (errorInfo.value.title ? i18n.get(errorInfo.value.title) : undefined));

        const description = computed(() => {
            const { messages, requestId } = errorInfo.value;
            const options = requestId ? { values: { requestId } } : undefined;
            const nodes: VNode[] = [];

            messages.forEach((key, index) => {
                if (index > 0) nodes.push(h('br'));
                nodes.push(h('span', { key }, i18n.get(key, options)));
            });

            nodes.push(h(LiveAnnouncement, { message: announcement.value }));

            return nodes;
        });

        const action = computed<
            | {
                  title: string;
                  event: () => void;
                  icon?: Component;
                  variant: 'primary';
              }
            | undefined
        >(() => {
            const { onContactSupport, refreshComponent } = errorInfo.value;

            if (onContactSupport) {
                return {
                    title: i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.contactSupport.label')),
                    event: onContactSupport,
                    variant: 'primary' as const,
                };
            }

            if (refreshComponent) {
                return {
                    title: i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.refresh.label')),
                    event: () => (configContext.hasError || !props.onRefresh ? refreshCurrentComponent : props.onRefresh)?.(),
                    icon: props.refreshIcon,
                    variant: 'primary' as const,
                };
            }

            return undefined;
        });

        return () => {
            const children = [
                h(iconComponent.value, { 'aria-hidden': 'true', class: iconClass.value }),
                h(
                    BentoEmptyState,
                    {
                        variant: props.variant,
                        title: title.value,
                        class: props.actions?.length ? styles.hasCustomActions : undefined,
                        ...(!props.actions ? { action: action.value } : {}),
                    },
                    { default: () => description.value }
                ),
            ];

            if (props.actions?.length) {
                children.push(h(BentoButtonActions, { actions: props.actions, class: styles.actions }));
            }

            return h('div', { class: styles.root }, children);
        };
    },
});

export default DataOverviewError;
