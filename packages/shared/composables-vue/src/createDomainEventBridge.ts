import { computed, getCurrentInstance, inject, onBeforeUpdate, provide, ref, type ComputedRef, type InjectionKey } from 'vue';

export type DomainEventTriggers<Events extends object> = {
    readonly [Name in keyof Events]: (payload: Events[Name]) => void;
};

export type DomainEventCallbacks<Events extends object> = {
    readonly [Name in keyof Events as `on${Capitalize<Name & string>}`]?: (payload: Events[Name]) => void;
};

export const createDomainEventBridge = <Events extends object>(name: string) => {
    const key: InjectionKey<DomainEventTriggers<Events>> = Symbol(name);

    return {
        hasListener: (eventName: Extract<keyof Events, string>): ComputedRef<boolean> => {
            const instance = getCurrentInstance();
            const listenerName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
            const readListener = () => !!instance?.vnode.props?.[listenerName];
            const hasListener = ref(readListener());
            onBeforeUpdate(() => {
                hasListener.value = readListener();
            });
            return computed(() => hasListener.value);
        },
        provideEvents: (triggers: DomainEventTriggers<Events>) => provide(key, triggers),
        useEvents: (): DomainEventTriggers<Events> => {
            const triggers = inject(key);
            if (!triggers) throw new Error(`${name} is not available.`);
            return triggers;
        },
    } as const;
};
