import { computed, shallowRef, type Component, type MaybeRefOrGetter, toValue } from 'vue';
import type { ErrorMessageInfo, ErrorMessageKey } from './getErrorMessage';
import { useLiveAnnouncement } from './useLiveAnnouncement';

export type DataOverviewErrorAction = Readonly<{
    event: () => void | Promise<void>;
    icon?: Component;
    title: string;
    variant: 'primary' | 'secondary';
}>;

export type DataOverviewErrorPresentation = Readonly<{
    action?: DataOverviewErrorAction;
    announcement: string;
    messages: readonly string[];
    title?: string;
}>;

/**
 * Action-label keys the overview error state can render, supplied by the embedding domain.
 * Domain-local translation names are opaque to portable code, so the contact-support,
 * refresh, and copy labels are provided per domain instead of being hardcoded here.
 */
export type DataOverviewActionKeys<Key extends string = string> = Readonly<{
    contactSupport: Key;
    copyDone: Key;
    copyErrorCode: Key;
    refresh: Key;
}>;

type UseDataOverviewErrorOptions<Key extends string> = Readonly<{
    actionKeys: DataOverviewActionKeys<Key>;
    copyIcon?: Component;
    errorInfo: MaybeRefOrGetter<ErrorMessageInfo<Key>>;
    onRefresh?: () => void | Promise<void>;
    refreshIcon?: Component;
    translate(
        key: ErrorMessageKey<Key>,
        options?: Readonly<{
            values: Readonly<Record<string, unknown>>;
        }>
    ): string;
}>;

export const useDataOverviewError = <Key extends string>({
    actionKeys,
    copyIcon,
    errorInfo: errorInfoSource,
    onRefresh,
    refreshIcon,
    translate,
}: UseDataOverviewErrorOptions<Key>) => {
    const { announce, announcement } = useLiveAnnouncement();
    const copiedRequestId = shallowRef<string>();
    const errorInfo = computed(() => toValue(errorInfoSource));
    const title = computed(() => (errorInfo.value.title ? translate(errorInfo.value.title) : undefined));
    const messages = computed(() => {
        const { messages: messageKeys, requestId } = errorInfo.value;
        const options = requestId ? { values: { requestId } } : undefined;
        return messageKeys.map(key => translate(key, options));
    });
    const action = computed<DataOverviewErrorAction | undefined>(() => {
        const { contactSupportLabel, onContactSupport, refreshComponent, requestId } = errorInfo.value;

        if (onContactSupport) {
            return {
                title: translate(contactSupportLabel ?? actionKeys.contactSupport),
                event: onContactSupport,
                variant: 'primary',
            };
        }

        if (refreshComponent && onRefresh) {
            return {
                title: translate(actionKeys.refresh),
                event: onRefresh,
                icon: refreshIcon,
                variant: 'primary',
            };
        }

        if (requestId && typeof navigator !== 'undefined' && navigator.clipboard) {
            return {
                title: translate(copiedRequestId.value === requestId ? actionKeys.copyDone : actionKeys.copyErrorCode),
                event: async () => {
                    await navigator.clipboard.writeText(requestId);
                    copiedRequestId.value = requestId;
                    await announce(() => translate(actionKeys.copyDone));
                },
                icon: copyIcon,
                variant: 'secondary',
            };
        }

        return undefined;
    });
    const presentation = computed<DataOverviewErrorPresentation>(() => ({
        action: action.value,
        announcement: announcement.value,
        messages: messages.value,
        title: title.value,
    }));

    return { presentation };
};

export default useDataOverviewError;
