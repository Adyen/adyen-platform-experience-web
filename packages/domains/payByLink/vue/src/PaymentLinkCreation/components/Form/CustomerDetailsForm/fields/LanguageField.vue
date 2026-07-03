<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SelectField from '../../../fields/SelectField.vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useWizard } from '../../../../composables/wizardContext';

const wizard = useWizard();
const { i18n, getCdnDataset } = useCoreContext();

const config = computed(() => wizard.getFieldConfig('shopperLocale'));
const configOptions = computed(() => (config.value.options as string[] | undefined) ?? []);

const languages = ref<Array<{ text: string; value: string | null }>>([]);
const isFetching = ref(true);

onMounted(async () => {
    try {
        if (getCdnDataset) {
            languages.value =
                (await getCdnDataset<Array<{ text: string; value: string | null }>>({ name: 'languages', extension: 'json', fallback: [] })) ?? [];
        }
    } finally {
        isFetching.value = false;
    }
});

const localeItems = computed(() =>
    languages.value
        .filter(({ value }) => (configOptions.value.length ? configOptions.value.includes(value as string) : true))
        .map(({ text, value }) => ({ id: value === null ? 'auto' : value, name: text }))
        .sort((a, b) => a.name.localeCompare(b.name))
);

const shouldHide = computed(() => !isFetching.value && localeItems.value.length === 0 && !config.value.required);
</script>

<template>
    <SelectField
        v-if="config.visible && !shouldHide"
        name="shopperLocale"
        :label="i18n.get('payByLink.creation.fields.language.label')"
        :items="localeItems"
        filterable
    />
</template>
