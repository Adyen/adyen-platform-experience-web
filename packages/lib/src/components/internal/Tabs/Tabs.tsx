import { useRef, useState } from 'preact/hooks';
import './Tabs.scss';
import classNames from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TabProps, TabComponentProps } from './types';

export const Tab: (props: TabProps) => null = () => null;

function Tabs<T extends TabProps[]>(props: TabComponentProps<T>) {
    const availableTabs = props.tabs.filter(tab => !tab.disabled);
    const { i18n } = useCoreContext();
    const defaultTab = !props.defaultActiveTab ? 0 : props.tabs.findIndex(tab => tab.label === props.defaultActiveTab);
    const [selectedIndex, setSelectedIndex] = useState(defaultTab === -1 ? 0 : defaultTab);
    const tabRefs = useRef<Record<number, HTMLButtonElement | null>>({});
    const setIndex = (index: number) => {
        const tab = tabRefs.current[index];
        tab?.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
        const count = availableTabs.length;

        const keyMap: Record<KeyboardEvent['key'], () => void> = {
            ArrowRight: () => setIndex((selectedIndex + 1) % count),
            ArrowLeft: () => setIndex((selectedIndex - 1 + count) % count),
            Home: () => setIndex(0),
            End: () => setIndex(count - 1),
        };

        if (keyMap[event.key]) {
            event.preventDefault();
            keyMap[event.key]?.();
        }
    };
    return (
        <>
            <div className="adyen-fp-tabs" role="tablist" aria-orientation="horizontal" tabIndex={0}>
                {availableTabs.map((tab, index) => (
                    <button
                        id={`tab-id-${index}`}
                        key={`tab-${index}`}
                        className={classNames('adyen-fp-tabs__tab', { 'adyen-fp-tabs__tab--active': index === selectedIndex })}
                        role="tab"
                        aria-controls={`panel-id-${index}`}
                        aria-selected={selectedIndex === index}
                        ref={el => (tabRefs.current[index] = el)}
                        onKeyDown={onKeyDown}
                        onClick={() => setSelectedIndex(index)}
                        onFocus={() => setSelectedIndex(index)}
                    >
                        {i18n.get(tab.label)}
                    </button>
                ))}
            </div>
            <div className="adyen-fp-tabpanel__wrapper">
                {availableTabs.map((tab, index) => (
                    <section
                        className="adyen-fp-tabpanel__content"
                        id={`panel-id-${index}`}
                        key={`tabpanel-${index}`}
                        hidden={selectedIndex !== index}
                        role="tabpanel"
                        aria-labelledby={`tab-id-${index}`}
                    >
                        {tab.content}
                    </section>
                ))}
            </div>
        </>
    );
}
Tabs.Tab = Tab;
export default Tabs;
