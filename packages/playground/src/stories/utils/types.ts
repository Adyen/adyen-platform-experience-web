import { ComponentClass, ComponentProps, ComponentType } from 'preact';
import { JSXInternal } from 'preact/src/jsx';
import { StoryFn, StoryObj } from '@storybook/preact';

export type ComponentStory<T extends ComponentType<any> | keyof JSXInternal.IntrinsicElements | ComponentClass<any, {}>> =
    | StoryObj<ComponentProps<T>>
    | StoryFn<ComponentProps<T>>;

type GlobalStoriesProps = { mockedApi?: boolean };

export type ElementProps<T extends new (...args: any) => any> = Omit<ConstructorParameters<T>[0] & GlobalStoriesProps, 'core'>;

export type ElementStory<T extends new (...args: any) => any> = StoryObj<ElementProps<T> & GlobalStoriesProps>;
