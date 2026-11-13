import { defineComponent, h, type PropType } from 'vue';
import { BentoButton, BentoLink } from '@adyen/bento-vue3';
import { isCustomDataObject } from './useCustomDataCells';
import { CUSTOM_FIELD_ATTRIBUTE } from './useCustomColumnWidths';
import styles from './CustomDataCell.module.scss';

export const CustomDataCell = defineComponent({
    name: 'CustomDataCell',

    props: {
        value: { type: null as unknown as PropType<unknown>, default: undefined },
        field: { type: String, default: undefined },
    },

    setup(props) {
        return () => {
            const data: unknown = props.value;
            const fieldAttrs = props.field ? { [CUSTOM_FIELD_ATTRIBUTE]: props.field } : {};

            if (!isCustomDataObject(data)) {
                return h('span', { ...fieldAttrs, class: styles.text }, String(data ?? ''));
            }

            if (data.type === 'icon' && data.config?.src) {
                const alt = data.config.alt != null ? data.config.alt : data.value;
                return h('div', { ...fieldAttrs, class: [styles.root, data.config.className] }, [
                    h('img', { src: data.config.src, alt }),
                    data.value != null && String(data.value).trim() ? h('span', { class: styles.iconLabel }, String(data.value)) : null,
                ]);
            }
            if (data.type === 'text') {
                return h('span', { ...fieldAttrs, class: [styles.text, data.config?.className] }, String(data.value ?? ''));
            }
            if (data.type === 'button' && data.config) {
                return h(
                    BentoButton,
                    {
                        ...fieldAttrs,
                        variant: 'secondary',
                        class: [styles.button, data.config.className],
                        onClick: (e: Event) => {
                            e.stopPropagation();
                            data.config.action?.();
                        },
                    },
                    () => String(data.value)
                );
            }
            if (data.type === 'link' && data.config) {
                return h(BentoLink, { ...fieldAttrs, to: data.config.href, external: true, class: [styles.link, data.config.className] }, () =>
                    String(data.value ?? '')
                );
            }
            return h('span', { ...fieldAttrs, class: styles.text }, String(data.value ?? ''));
        };
    },
});
