import Tabs, { Tab } from './Tabs';

const ExampleContent = (props: { content: string }) => (
    <div>
        <h2>{props.content}</h2>
    </div>
);

export function TabsStories() {
    // The content can be set as a child of the Tab component or as a prop named "content"
    // The "defaultActiveTab" must be one of the "label" defined in the tabs components
    return (
        <Tabs defaultActiveTab={'paymentId'}>
            <Tab label={'account'}>
                <ExampleContent content={'Account tab content'} />
            </Tab>
            <Tab label={'paymentId'} content={<ExampleContent content={'Payment id tab content'} />} />
        </Tabs>
    );
}
