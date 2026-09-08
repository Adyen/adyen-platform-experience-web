import { defineComponent, h, type PropType } from 'vue';
import { BentoButton, BentoLink } from '@adyen/bento-vue3';
import { isCustomDataObject } from './useCustomDataCells';
import styles from './CustomDataCell.module.scss';

export const CustomDataCell = defineComponent({
    name: 'CustomDataCell',

    props: {
        value: { type: null as unknown as PropType<unknown>, default: undefined },
    },

    setup(props) {
        return () => {
            const data: unknown = props.value;

            if (!isCustomDataObject(data)) {
                return h('span', {}, String(data ?? ''));
            }

            if (data.type === 'icon' && data.config?.src) {
                const alt = data.config.alt != null ? data.config.alt : data.value;
                return h('div', { class: [styles.root, data.config.className] }, [
                    h('img', { src: data.config.src, alt }),
                    String(data.value).trim() ? h('span', {}, String(data.value)) : null,
                ]);
            }
            if (data.type === 'text') {
                return h('span', { class: data.config?.className }, String(data.value ?? ''));
            }
            if (data.type === 'button' && data.config) {
                return h(
                    BentoButton,
                    {
                        variant: 'secondary',
                        class: data.config.className,
                        onClick: (e: Event) => {
                            e.stopPropagation();
                            data.config.action?.();
                        },
                    },
                    () => String(data.value)
                );
            }
            if (data.type === 'link' && data.config) {
                return h(BentoLink, { to: data.config.href, external: true, class: data.config.className }, () => String(data.value));
            }
            return h('span', {}, String(data.value ?? ''));
        };
    },
});
