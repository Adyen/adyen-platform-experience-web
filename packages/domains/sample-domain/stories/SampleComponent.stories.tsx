import { Meta, StoryObj } from '@storybook/preact';
import { SampleComponent } from '../preact/src';

const meta: Meta<typeof SampleComponent> = {
    title: 'Sample Domain/Sample Component',
    component: SampleComponent,
};

export const Default: StoryObj<typeof SampleComponent> = {
    args: {
        name: 'World',
    },
};

export default meta;
