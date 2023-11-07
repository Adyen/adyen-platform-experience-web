import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import './Tabs.scss';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TabProps, TabComponentProps } from './types';

function Tabs<T extends TabProps[]>(props: TabComponentProps<T>) {
    const availableTabs = props.tabs;
    const { i18n } = useCoreContext();
    const defaultTab = !props.defaultActiveTab ? 0 : props.tabs.findIndex(tab => tab.id === props.defaultActiveTab);
    const [selectedIndex, setSelectedIndex] = useState(defaultTab === -1 ? 0 : defaultTab);
    const tabRefs = useRef<Record<number, HTMLButtonElement | null>>({});
    const setIndex = useCallback((index: number) => {
        const tab = tabRefs.current[index];
        tab?.focus();
    }, []);

    const onKeyDown = useMemo(() => {
        const count = availableTabs.length;
        const keyMap: Record<KeyboardEvent['key'], () => void> = {
            ArrowRight: () => setIndex((selectedIndex + 1) % count),
            ArrowLeft: () => setIndex((selectedIndex - 1 + count) % count),
            Home: () => setIndex(0),
            End: () => setIndex(count - 1),
        };

        return (event: KeyboardEvent) => {
            if (keyMap[event.key]) {
                event.preventDefault();
                keyMap[event.key]?.();
            }
        };
    }, [availableTabs, selectedIndex]);

    return (
        <section aria-label={i18n.get('tabs')}>
            <div className="adyen-fp-tabs" role="tablist" aria-orientation="horizontal">
                {availableTabs.map((tab, index) => (
                    <button
                        id={`tab-id-${tab.id}`}
                        key={`tab-${tab.id}`}
                        name={tab.id}
                        className="adyen-fp-tabs__tab"
                        role="tab"
                        aria-controls={`panel-id-${tab.id}`}
                        aria-selected={selectedIndex === index}
                        ref={el => (tabRefs.current[index] = el)}
                        onKeyDown={onKeyDown}
                        // TODO revisit this solution when accessibility provisions are merged
                        onClick={index === selectedIndex ? undefined : () => setSelectedIndex(index)}
                        onFocus={() => setSelectedIndex(index)}
                        tabIndex={selectedIndex === index ? 0 : -1}
                        disabled={tab.disabled}
                    >
                        <span className="adyen-fp-tabs__tab-content-tab-label">{i18n.get(tab.label)}</span>
                    </button>
                ))}
            </div>
            <div className="adyen-fp-tabpanel__wrapper">
                {availableTabs.map((tab, index) => (
                    <section
                        name={tab.id}
                        className="adyen-fp-tabpanel__content"
                        id={`panel-id-${tab.id}`}
                        key={`tabpanel-${tab.id}`}
                        hidden={selectedIndex !== index}
                        role="tabpanel"
                        aria-labelledby={`tab-id-${tab.id}`}
                    >
                        {tab.content}
                    </section>
                ))}
            </div>
        </section>
    );
}
export default Tabs;
