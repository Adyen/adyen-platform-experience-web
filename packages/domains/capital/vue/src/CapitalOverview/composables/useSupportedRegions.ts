import { onMounted, ref, type Ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import localSupportedRegions from '../../../../domain/src/config/supportedRegions.json';
import { getSupportedRegions, SupportedRegions } from '../utils/getSupportedRegions';

export const useSupportedRegions = (): Ref<SupportedRegions> => {
    const { getCdnConfig } = useCoreContext();
    const supportedRegions = ref<SupportedRegions>(localSupportedRegions);

    onMounted(() => {
        void getSupportedRegions(getCdnConfig).then(regions => {
            supportedRegions.value = regions;
        });
    });

    return supportedRegions;
};
