import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import { defineDomainComponent } from './defineDomainComponent';
import type { DomainComponentDefinition } from './types';

type Dependencies = Readonly<{
    label: string;
}>;

type Props = Readonly<{
    value: string;
}>;

type Update = Readonly<{
    next: string;
}>;

describe('defineDomainComponent', () => {
    test('supports direct definitions with inferred types', async () => {
        const instance = {
            mount: (_target: string) => {},
            unmount: () => {},
            update: (_update: Update) => {},
        };

        const create = vi.fn((_input: Readonly<{ dependencies: Dependencies; props: Props }>) => instance);
        const definition = defineDomainComponent({ create });

        expectTypeOf(definition).toMatchTypeOf<DomainComponentDefinition<Props, Dependencies, Update, string>>();

        await definition.create({
            dependencies: { label: 'Label' },
            props: { value: 'value' },
        });

        expect(Object.isFrozen(definition)).toBe(true);
        expect(create).toHaveBeenCalledWith({
            dependencies: { label: 'Label' },
            props: { value: 'value' },
        });
    });

    test('contextually types curried definitions', () => {
        const definition = defineDomainComponent<Props, Dependencies, Update, string>()({
            create: input => {
                expectTypeOf(input.dependencies).toEqualTypeOf<Dependencies>();
                expectTypeOf(input.props).toEqualTypeOf<Props>();
                return {
                    mount: target => {
                        expectTypeOf(target).toEqualTypeOf<string>();
                    },
                    unmount: () => {},
                    update: update => {
                        expectTypeOf(update).toEqualTypeOf<Update>();
                    },
                };
            },
        });

        expect(Object.isFrozen(definition)).toBe(true);
    });

    test('rejects definitions without a create function', () => {
        expect(() => defineDomainComponent(null as never)).toThrow('A domain definition requires a create function.');
        expect(() => defineDomainComponent<Props>()({} as never)).toThrow('A domain definition requires a create function.');
    });
});
