import { TabComponentProps } from './types';
import { AriaAttributes } from 'preact/compat';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import useTabbedControl from '../../../hooks/useTabbedControl';
import Typography from '../Typography/Typography';
import './Tabs.scss';

function Tabs<TabId extends string>({
    ['aria-label']: ariaLabel,
    activeTab,
    tabs,
    onChange,
}: TabComponentProps<TabId> & Pick<AriaAttributes, 'aria-label'>) {
    const { activeIndex, onClick, onKeyDown, refs, uniqueId } = useTabbedControl({ onChange, options: tabs, activeOption: activeTab });
    const { i18n } = useCoreContext();
    return (
        <div>
            <div className="adyen-pe-tabs" role="tablist" aria-orientation="horizontal" aria-label={ariaLabel}>
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
                    <div
                        role="tabpanel"
                        key={`panel:${uniqueId}-${tab.id}`}
                        id={`panel:${uniqueId}-${tab.id}`}
                        className="adyen-pe-tabpanels__panel"
                        aria-labelledby={`tab:${uniqueId}-${tab.id}`}
                        hidden={activeIndex !== index}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tabs;
