import { useId } from 'react';
import { clearEvents, useEvents } from './events';

export const EventLog = () => {
    const events = useEvents();
    const titleId = useId();

    return (
        <section className="event-log" aria-labelledby={titleId}>
            <header className="event-log__header">
                <h2 id={titleId} className="playground__group-title">
                    {'Event log'}
                </h2>
                <button type="button" className="playground__button playground__button--small" onClick={clearEvents} disabled={events.length === 0}>
                    {'Clear'}
                </button>
            </header>
            {events.length > 0 ? (
                <ol className="event-log__list" aria-live="polite">
                    {events.map(event => (
                        <li key={event.id} className={`event-log__item event-log__item--${event.kind}`}>
                            <time className="event-log__time">{event.time}</time>
                            <span className="event-log__name">{event.name}</span>
                            {event.detail && <code className="event-log__detail">{event.detail}</code>}
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="event-log__empty">{'Callbacks and prop updates appear here.'}</p>
            )}
        </section>
    );
};
