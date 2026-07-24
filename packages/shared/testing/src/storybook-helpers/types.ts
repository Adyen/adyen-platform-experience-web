import { StoryObj } from '@storybook/preact';
import { CoreOptions } from '@integration-components/sdk-internal';

type GlobalStoriesProps = {
    mockedApi?: boolean;
    balanceAccountId?: string;
    compact?: boolean;
    component: any;
    compact?: boolean;
    coreOptions?: Partial<CoreOptions>;
    skipDecorators?: boolean;
};

type ComponentPropsOf<T> = T extends new (...args: any) => any ? ConstructorParameters<T>[0] : T;

export type ElementProps<T> = Omit<ComponentPropsOf<T> & GlobalStoriesProps, 'core'>;

export type ElementStory<T, ExtraProps = object> = StoryObj<ExtraProps & ElementProps<T> & GlobalStoriesProps>;

export type SessionControls = { session: { roles: string[]; accountHolderId?: string } };

export type SetupControls = { legalEntity: { regions: { type: string; value: string }[]; countryCode: string } };
