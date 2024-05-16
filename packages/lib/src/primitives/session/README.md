# Session

## Background

## Motivation

## Design objectives

<!-- ### Single shared instance -->
<!-- In practice, it is highly unlikely to have more than one user session per application at any given time. Consequently, having multiple session instances will be absolutely unnecessary. It is for this reason that the session primitive is a singleton by design, and the same instance is used everywhere session related information or session-aware logic is required. On the plus side, maintaining only one instance of the session primitive contributes to keeping the memory footprint as tiny as possible. -->

### Tiny memory footprint

-   Every object in memory that could be shared or recycled is indeed, so that creation of new objects only happen when absolutely necessary.
-   A lazy approach is preferred to an eager approach in the creation of new objects where possible and whenever it makes more sense.
-   Logic relying on memory constructs such as closures and recursive function calls are avoided as much as possible in favour of memory friendlier alternatives.
-   Supposedly short-lived objects in memory are not used or exposed in ways that could interfere with, or in the worst case, completely hinder their garbage collection.

### Logic collocation

All logic related to the provisioning and managing of application session should be as close to each other as possible. For example,

### Observability

There should be one or more mechanisms for observing notable changes or events related to the application session — for example, when the session just expired or was just refreshed. This gives consumers of the session an opportunity to react to session changes or events when it matters and in real time.

### Portability and agnosticism

### Immutability and encapsulation

### Active expiration management

## Implementation details

### Dependencies

### Session refresh

### Session expiration

### Session-aware HTTP

## Adoption proposals

### Single shared instance (recommended)

In practice, it is highly unlikely to have more than one user session per service at any given time. Consequently, having multiple session instances for each unique service will be absolutely unnecessary. For this reason, it is highly recommended that the same instance is used everywhere session related information or session-aware logic is required for a particular service. On the plus side, maintaining only one session instance per service contributes to the overall goal to keep the memory footprint as tiny as possible.

### Auth context (recommended)

```tsx
interface AuthProviderProps {
    children?: any;
    loadingContext?: string;
    onSessionCreate?: SessionRequest;
}

const AuthProvider = ({ children, loadingContext, onSessionCreate: createNextSession }: AuthProviderProps) => {
    const [expired, setExpired] = useState(session.isExpired !== false);

    const context = useMemo(() => {
        const { endpoints, error, hasError, http, isExpired, ready, refresh } = session;
        return { endpoints, error, hasError, http, isExpired, ready, refresh } as const;
    }, [expired]);

    const refresh = useCallback(() => context.refresh(), [context.refresh]);

    useEffect(() => {
        const expiredTrue = () => setExpired(true);
        const expiredFalse = () => setExpired(false);

        $eventRoot.addEventListener(EVENT_SESSION_EXPIRED, expiredTrue);
        $eventRoot.addEventListener(EVENT_SESSION_REFRESHED, expiredFalse);

        return () => {
            $eventRoot.removeEventListener(EVENT_SESSION_EXPIRED, expiredTrue);
            $eventRoot.removeEventListener(EVENT_SESSION_REFRESHED, expiredFalse);
        };
    }, [setExpired]);

    useEffect(() => {
        context.refresh({ createNextSession, loadingContext } as const);
    }, [context.refresh, createNextSession, loadingContext]);

    return <AuthContext.Provider value={{ ...context, refresh }}>{toChildArray(children)}</AuthContext.Provider>;
};
```
