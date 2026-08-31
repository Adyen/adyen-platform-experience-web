import type { DomainComponentDefinition, NoDependencies } from './types';

const freezeDefinition = <Definition>(definition: Definition): Definition => {
    if (typeof definition !== 'object' || definition === null || typeof (definition as Partial<DomainComponentDefinition>).create !== 'function') {
        throw new TypeError('A domain definition requires a create function.');
    }
    return Object.freeze({ ...definition });
};

export function defineDomainComponent<Props, Dependencies = NoDependencies, Update = unknown, MountTarget = unknown>(): (
    definition: DomainComponentDefinition<Props, Dependencies, Update, MountTarget>
) => DomainComponentDefinition<Props, Dependencies, Update, MountTarget>;
export function defineDomainComponent<Props, Dependencies = NoDependencies, Update = unknown, MountTarget = unknown>(
    definition: DomainComponentDefinition<Props, Dependencies, Update, MountTarget>
): DomainComponentDefinition<Props, Dependencies, Update, MountTarget>;
export function defineDomainComponent(definition?: unknown): unknown {
    if (definition === undefined) return freezeDefinition;
    return freezeDefinition(definition);
}
