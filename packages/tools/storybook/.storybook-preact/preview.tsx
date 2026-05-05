import type { Preview } from '@storybook/preact';
import { Container } from '../src/utils/Container';
import { sharedPreviewConfig } from '../shared/previewDefaults';

const preview: Preview = {
    ...sharedPreviewConfig,
    render: (args, context) => {
        return <Container component={args.component} componentConfiguration={args} context={context} mockedApi={args.mockedApi} />;
    },
};

export default preview;
