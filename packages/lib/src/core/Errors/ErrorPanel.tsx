import { useEffect } from 'preact/hooks';
import './ErrorPanel.scss';

export interface ErrorPanelObj {
    errorMessages: string[];
    fieldList: string[];
}

export interface ErrorPanelProps {
    id?: string;
    heading?: string;
    errors: ErrorPanelObj;
    callbackFn?: (who: ErrorPanelObj) => void;
    showPanel?: boolean;
}

export function ErrorPanel({ id = 'ariaConsolidatedErrorField', heading = 'Errors:', errors, callbackFn, showPanel = false }: ErrorPanelProps) {
    if (!errors) return null;

    const { errorMessages } = errors;

    // Perform passed callback, if specified
    useEffect(() => {
        callbackFn?.(errors);
    }, [errors]);

    return (
        <div className={showPanel ? 'adyen-pe-error-panel' : 'adyen-pe-error-panel--sr-only'} id={id} aria-live="polite">
            <div className="adyen-pe-error-panel__wrapper">
                <div className="adyen-pe-error-panel__header">
                    <span className="adyen-pe-error-panel__title">{heading}</span>
                </div>
                {errorMessages.map(error => (
                    <div key={error} className="adyen-pe-error-panel__error">
                        {error}
                    </div>
                ))}
            </div>
        </div>
    );
}
