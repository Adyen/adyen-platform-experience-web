import Tabs from './Tabs';
import { TabProps } from './types';

const ExampleContent = (props: { content: string }) => (
    <div>
        <h2>{props.content}</h2>
    </div>
);

// If you don't do the "TabProps[]" type annotation the Tabs component will throw an error.
const EXAMPLE_TABS: TabProps[] = [
    {
        label: 'account',
        content: <ExampleContent content={'Account tab content'} />,
    },
    {
        label: 'paymentId',
        content: <ExampleContent content={'Payment ID tab content'} />,
    },
];

//defaultActiveTab must be one of the labels in the tabs array
export function TabsStories() {
    return <Tabs tabs={EXAMPLE_TABS} defaultActiveTab={'paymentId'} />;
}

//If the tabs are defined directly in the component, you avoid the type annotation and can leverage type inference for the defaultActiveTab prop
export function TabsStories2() {
    return (
        <Tabs
            tabs={[
                {
                    label: 'account',
                    content: <ExampleContent content={'Account tab content'} />,
                },
                {
                    label: 'paymentId',
                    content: <ExampleContent content={'Payment ID tab content'} />,
                },
            ]}
            defaultActiveTab={'paymentId'}
        />
    );
}
