import { ComponentClass, ComponentProps, ComponentType } from 'preact';
import { JSXInternal } from 'preact/src/jsx';
import { StoryFn, StoryObj } from '@storybook/preact';
import { CoreOptions } from '../../src';

export type ComponentStory<T extends ComponentType<any> | keyof JSXInternal.IntrinsicElements | ComponentClass<any, {}>> =
    | StoryObj<ComponentProps<T>>
    | StoryFn<ComponentProps<T>>;

type GlobalStoriesProps = {
    mockedApi?: boolean;
    balanceAccountId?: string;
    component: any;
    coreOptions?: Partial<CoreOptions>;
    skipDecorator?: boolean;
};

export type ElementProps<T extends new (...args: any) => any> = Omit<ConstructorParameters<T>[0] & GlobalStoriesProps, 'core'>;

export type ElementStory<T extends new (...args: any) => any, ExtraProps = {}> = StoryObj<ExtraProps & ElementProps<T> & GlobalStoriesProps>;

export type SessionControls = { session: { roles: string[]; accountHolderId?: string } };
