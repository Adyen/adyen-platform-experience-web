import { StoryObj } from '@storybook/preact';
import { CoreOptions } from '@integration-components/sdk-internal';

type GlobalStoriesProps = {
    mockedApi?: boolean;
    balanceAccountId?: string;
    component: any;
    coreOptions?: Partial<CoreOptions>;
    skipDecorators?: boolean;
};

export type ElementProps<T extends new (...args: any) => any> = Omit<ConstructorParameters<T>[0] & GlobalStoriesProps, 'core'>;

export type ElementStory<T extends new (...args: any) => any, ExtraProps = object> = StoryObj<ExtraProps & ElementProps<T> & GlobalStoriesProps>;

export type SessionControls = { session: { roles: string[]; accountHolderId?: string } };

export type SetupControls = { legalEntity: { regions: { type: string; value: string }[]; countryCode: string } };
