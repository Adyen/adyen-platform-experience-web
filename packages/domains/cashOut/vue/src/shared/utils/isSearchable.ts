/** From this many accounts, a dropdown of them can be searched, so one can be found among many. */
export const SEARCHABLE_FROM_OPTIONS = 10;

/** Whether a dropdown of these options can be searched: all of them count, the disabled ones too, as they are listed. */
export const isSearchable = (options: readonly unknown[]) => options.length >= SEARCHABLE_FROM_OPTIONS;
