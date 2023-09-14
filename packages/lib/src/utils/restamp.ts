const restamp = (() => {
    type Restamp = {
        (): number;
        (time?: string | number | Date): number;
        get tz(): string | undefined;
        set tz(timezone: string | undefined | null);
    };

    let currentTimeZone: Restamp['tz'] | null = null;
    let formatterInstance: Intl.DateTimeFormat | undefined;
    let formattingOptions: Intl.DateTimeFormatOptions | undefined;

    const DEFAULT_LOCALE = 'en-US' as const;

    try {
        formattingOptions = { dateStyle: 'short', timeStyle: 'medium' };
        currentTimeZone = new Intl.DateTimeFormat(DEFAULT_LOCALE, formattingOptions).resolvedOptions().timeZone;
    } catch (ex) {
        currentTimeZone = formattingOptions = undefined;
    }

    const localTimeZone = currentTimeZone;

    const restamp = ((...args: [(string | number | Date)?]): number => {
        if (args.length === 0) return restamp(Date.now());

        const time = args[0];
        const timestamp = new Date(time as NonNullable<typeof time>).getTime();

        if (formatterInstance === undefined) return timestamp;

        const restampedTimestamp = new Date(formatterInstance.format(timestamp)).getTime();

        if (restampedTimestamp !== timestamp) {
            const milliseconds = timestamp % 1000;
            return Math.floor(restampedTimestamp / 1000) * 1000 + milliseconds;
        }

        return restampedTimestamp;
    }) as Restamp;

    return Object.defineProperties(restamp, {
        tz: {
            get: () => currentTimeZone,
            set:
                localTimeZone !== undefined
                    ? (timeZone?: Restamp['tz'] | null) => {
                          if (timeZone != undefined) {
                              const nextFormatterInstance = new Intl.DateTimeFormat(DEFAULT_LOCALE, { ...formattingOptions, timeZone });
                              const nextTimeZone = nextFormatterInstance.resolvedOptions().timeZone;

                              if (currentTimeZone === nextTimeZone) return;

                              currentTimeZone = nextTimeZone;
                              formatterInstance = nextFormatterInstance;
                          } else {
                              currentTimeZone = localTimeZone;
                              formatterInstance = undefined;
                          }
                      }
                    : undefined,
        },
    });
})();

export default restamp;
