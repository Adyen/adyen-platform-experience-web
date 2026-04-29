export interface CSSOverrideReport {
    type: 'css_override_report';
    sdkVersion: string;
    overriddenClasses: string[];
    perClassProps: Record<string, string[]>;
    crossOriginSheetsSkipped: number;
    scanMs: number;
}

export interface CSSOverrideTrackerOptions {
    sdkClassPrefix?: string;
    sdkStylesheetAttr?: string;
    sdkStylesheetAttrValue?: string;
    debounceMs?: number;
    onReport?: (report: CSSOverrideReport) => void;
}
