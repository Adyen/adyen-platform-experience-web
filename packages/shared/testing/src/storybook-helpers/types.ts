import type { StoryObj } from '@storybook/vue3';
import { CoreOptions } from '@integration-components/sdk-internal';
import type { DensityMode } from '@integration-components/types';

type GlobalStoriesProps = {
    mockedApi?: boolean;
    balanceAccountId?: string;
    compact?: boolean;
    component: any;
    coreOptions?: Partial<CoreOptions>;
    skipDecorators?: boolean;
    density?: DensityMode;
};

type ComponentPropsOf<T> = T extends new (...args: any) => any ? ConstructorParameters<T>[0] : T;

export type ElementProps<T> = Omit<ComponentPropsOf<T> & GlobalStoriesProps, 'core'>;

export type ElementStory<T, ExtraProps = object> = StoryObj<ExtraProps & ElementProps<T> & GlobalStoriesProps>;

export type SessionControls = { session: { roles: string[]; accountHolderId?: string } };
