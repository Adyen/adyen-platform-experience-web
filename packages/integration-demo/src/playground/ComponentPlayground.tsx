import { useEffect, useMemo } from 'react';
import { useAdyenElement, type AdyenElementClass, type ElementProps } from '../hooks/useAdyenElement';
import { describeValue, getRemountKey } from './controls';
import { CONTROLS_PANEL_ID, setControlsPanelAvailable, setControlsPanelOpen, useControlsPanel } from './controlsPanel';
import { GLOBAL_SECTIONS } from './coreOptions';
import { EventLog } from './EventLog';
import { clearEvents, logEvent } from './events';
import { useGlobalOptions } from './GlobalOptionsProvider';
import { PropsPanel } from './PropsPanel';
import { useControlValues } from './useControlValues';
import type { Control, ControlSection, ControlValues } from './types';
import './playground.css';

interface ComponentPlaygroundProps<Props extends { core: unknown }> {
    title: string;
    element: AdyenElementClass<Props>;
    sections: readonly ControlSection[];
    toProps: (values: ControlValues) => ElementProps<Props>;
    narrow?: boolean;
}

export const ComponentPlayground = <Props extends { core: unknown }>({
    title,
    element,
    sections,
    toProps,
    narrow,
}: ComponentPlaygroundProps<Props>) => {
    const { values, setValue, reset } = useControlValues(sections);
    const globalOptions = useGlobalOptions();
    const { open: panelOpen } = useControlsPanel();
    const props = useMemo(() => toProps(values), [toProps, values]);
    const { containerRef, remount } = useAdyenElement(element, props, getRemountKey(sections, values));

    useEffect(() => {
        clearEvents();
        setControlsPanelAvailable(true);
        return () => setControlsPanelAvailable(false);
    }, []);

    const handleChange = (control: Control, value: string) => {
        if (values[control.key] === value) return;
        setValue(control.key, value);
        logEvent(control.remount ? 'remount' : 'update()', `${control.label} = ${describeValue(control, value)}`, 'playground');
    };

    const handleGlobalChange = (control: Control, value: string) => {
        if (globalOptions.values[control.key] === value) return;
        globalOptions.setValue(control.key, value);
        logEvent('core.update()', `${control.label} = ${describeValue(control, value)}`, 'playground');
    };

    const handleReset = () => {
        reset();
        logEvent('reset', 'Component props restored to their defaults', 'playground');
    };

    const handleRemount = () => {
        remount();
        logEvent('remount', undefined, 'playground');
    };

    return (
        <div className={`playground${panelOpen ? '' : ' playground--collapsed'}`}>
            <section className="playground__stage" aria-label={title}>
                <div ref={containerRef} className={narrow ? 'component-narrow' : undefined} />
            </section>
            <aside id={CONTROLS_PANEL_ID} className="playground__panel" aria-label={`${title} controls`} hidden={!panelOpen}>
                <div className="playground__toolbar">
                    <button type="button" className="playground__button" onClick={handleReset}>
                        {'Reset props'}
                    </button>
                    <button type="button" className="playground__button" onClick={handleRemount}>
                        {'Remount'}
                    </button>
                    <button type="button" className="playground__button playground__close" onClick={() => setControlsPanelOpen(false)}>
                        {'Close'}
                    </button>
                </div>
                <div className="playground__controls">
                    <h2 className="playground__group-title">{'Component props'}</h2>
                    <p className="playground__group-hint">{'Applied live through element.update().'}</p>
                    <PropsPanel sections={sections} values={values} onChange={handleChange} />
                    <h2 className="playground__group-title">{'Global options'}</h2>
                    <p className="playground__group-hint">{'Shared by every component through core.update().'}</p>
                    <PropsPanel sections={GLOBAL_SECTIONS} values={globalOptions.values} onChange={handleGlobalChange} />
                </div>
                <EventLog />
            </aside>
        </div>
    );
};
