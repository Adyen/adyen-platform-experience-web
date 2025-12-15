import { PBLFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { useFetch } from '../../../../../../../../hooks/useFetch';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';

export const LanguageField = () => {
    const { i18n, getCdnDataset } = useCoreContext();

    const languagesQuery = useFetch({
        fetchOptions: { enabled: true },
        queryFn: useCallback(async () => {
            if (getCdnDataset) {
                return (
                    (await getCdnDataset<Array<{ text: string; value: string | null }>>({
                        name: 'languages',
                        extension: 'json',
                        fallback: [] as Array<{ text: string; value: string | null }>,
                    })) ?? []
                );
            }
            return [] as Array<{ text: string; value: string | null }>;
        }, [getCdnDataset]),
    });

    const localeListItems = useMemo(() => {
        const langs = languagesQuery.data ?? [];
        return langs
            .map(({ text, value }) => {
                return {
                    // TODO - Handle 'auto detect' option when submitting information to the BE
                    id: value === null ? 'auto' : value,
                    name: text,
                };
            })
            .sort(({ name: a }, { name: b }) => a.localeCompare(b));
    }, [languagesQuery.data]);

    return (
        <FormSelect<PBLFormValues>
            filterable
            fieldName="shopperLocale"
            label={i18n.get('payByLink.linkCreation.fields.language.label')}
            items={localeListItems}
            readonly={languagesQuery.isFetching}
        />
    );
};
