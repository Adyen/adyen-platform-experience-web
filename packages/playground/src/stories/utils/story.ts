import { StoryFn, StoryObj } from '@storybook/preact';
import { ComponentType, ComponentProps } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export type Story<T extends ComponentType<any> | keyof JSXInternal.IntrinsicElements> = StoryObj<ComponentProps<T>> | StoryFn<ComponentProps<T>>;
