import { TabComponentProps, TabProps } from './types';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import useTabbedControl from '../../../hooks/useTabbedControl';
import Typography from '../Typography/Typography';
import './Tabs.scss';

function Tabs<T extends TabProps[]>({ defaultActiveTab, tabs }: TabComponentProps<T>) {
    const { activeIndex, setActiveIndex, onKeyDown, refs, uniqueId } = useTabbedControl(tabs, defaultActiveTab);
    const { i18n } = useCoreContext();
    return (
        <section aria-label={i18n.get('tabs')}>
            <div className="adyen-fp-tabs" role="tablist" aria-orientation="horizontal">
                {tabs.map((tab, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <button
                            role="tab"
                            name={tab.id}
                            ref={refs[index]}
                            key={`tab:${uniqueId}-${tab.id}`}
                            id={`tab:${uniqueId}-${tab.id}`}
                            className="adyen-fp-tabs__tab"
                            aria-controls={`panel:${uniqueId}-${tab.id}`}
                            aria-selected={isActive}
                            onClick={isActive ? undefined : () => setActiveIndex(index)}
                            onKeyDown={onKeyDown}
                            disabled={tab.disabled}
                            tabIndex={isActive ? 0 : -1}
                        >
                            <Typography
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.BODY}
                                className="adyen-fp-tabs__tab-content-tab-label"
                                stronger
                            >
                                {i18n.get(tab.label)}
                            </Typography>
                        </button>
                    );
                })}
            </div>
            <div className="adyen-fp-tabpanel__wrapper">
                {tabs.map((tab, index) => (
                    <section
                        role="tabpanel"
                        key={`tabpanel:${uniqueId}-${tab.id}`}
                        id={`panel:${uniqueId}-${tab.id}`}
                        className="adyen-fp-tabpanel__content"
                        aria-labelledby={`tab:${uniqueId}-${tab.id}`}
                        hidden={activeIndex !== index}
                    >
                        {tab.content}
                    </section>
                ))}
            </div>
        </section>
    );
}

export default Tabs;
