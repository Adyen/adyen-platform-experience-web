import { TabComponentProps } from './types';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import useTabbedControl from '../../../hooks/useTabbedControl';
import Typography from '../Typography/Typography';
import './Tabs.scss';

function Tabs<TabId extends string>({ defaultActiveTab, tabs, onChange }: TabComponentProps<TabId>) {
    const { activeIndex, onClick, onKeyDown, refs, uniqueId } = useTabbedControl({ onChange, options: tabs, defaultOption: defaultActiveTab });
    const { i18n } = useCoreContext();
    return (
        <section aria-label={i18n.get('tabs')}>
            <div className="adyen-pe-tabs" role="tablist" aria-orientation="horizontal">
                {tabs.map((tab, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <button
                            role="tab"
                            name={tab.id}
                            ref={refs[index]}
                            key={`tab:${uniqueId}-${tab.id}`}
                            id={`tab:${uniqueId}-${tab.id}`}
                            className="adyen-pe-tabs__tab"
                            aria-controls={`panel:${uniqueId}-${tab.id}`}
                            aria-selected={isActive}
                            onClick={isActive ? undefined : onClick}
                            onKeyDown={onKeyDown}
                            disabled={tab.disabled}
                            tabIndex={isActive ? 0 : -1}
                        >
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className="adyen-pe-tabs__tab-label" stronger>
                                {i18n.get(tab.label)}
                            </Typography>
                        </button>
                    );
                })}
            </div>
            <div className="adyen-pe-tabpanels">
                {tabs.map((tab, index) => (
                    <section
                        role="tabpanel"
                        key={`panel:${uniqueId}-${tab.id}`}
                        id={`panel:${uniqueId}-${tab.id}`}
                        className="adyen-pe-tabpanels__panel"
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
