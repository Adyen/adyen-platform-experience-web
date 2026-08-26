import { StoryObj } from '@storybook/preact';
import type { CoreOptions } from '@integration-components/sdk-internal';

type GlobalStoriesProps<Options extends object = CoreOptions> = {
    mockedApi?: boolean;
    balanceAccountId?: string;
    compact?: boolean;
    component: any;
    coreOptions?: Partial<Options>;
    skipDecorators?: boolean;
};

type ComponentPropsOf<T> = T extends new (...args: any) => any ? ConstructorParameters<T>[0] : T;

export type ElementProps<T, Options extends object = CoreOptions> = Omit<ComponentPropsOf<T> & GlobalStoriesProps<Options>, 'core'>;

export type ElementStory<T, ExtraProps = object, Options extends object = CoreOptions> = StoryObj<ExtraProps & ElementProps<T, Options>>;

export type SessionControls = { session: { roles: string[]; accountHolderId?: string } };
