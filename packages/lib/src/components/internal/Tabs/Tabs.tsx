import { useRef, useState } from 'preact/hooks';
import './Tabs.scss';
import classNames from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import { Children } from 'preact/compat';
import { TabComponentProps, TabProps, TabsComponentChildren, TabsComponentOneChild } from './types';
import { TranslationKey } from '../../../language/types';

export const Tab: <T extends TranslationKey>(props: TabProps<T>) => null = () => null;

function Tabs<T extends TabComponentProps | TabComponentProps[]>(
    props: TabsComponentOneChild<T extends TabComponentProps ? T : never> | TabsComponentChildren<T extends TabComponentProps[] ? T : never>
) {
    const isArrayOfTabs = (child: any): child is TabComponentProps[] => Children.count(child) > 1;
    const tabsArray = isArrayOfTabs(props.children) ? props.children : [props.children];

    Children.forEach(props.children, child => {
        if (child.type !== Tab) {
            throw new Error('Tabs component only accepts Tab components as children.');
        }
    });

    const availableTabs = tabsArray.filter(tab => !tab.props.disabled);
    const { i18n } = useCoreContext();
    const defaultTab =
        !props.defaultActiveTab || !isArrayOfTabs(props.children)
            ? 0
            : props.children.findIndex(child => child.props.label === props.defaultActiveTab) || 0;
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
                        {i18n.get(tab.props.label)}
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
                        {tab.props.content}
                    </section>
                ))}
            </div>
        </>
    );
}
Tabs.Tab = Tab;
export default Tabs;
