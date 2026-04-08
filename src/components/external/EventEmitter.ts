class EventEmitter {
    public events: { [key: string]: ((...args: any[]) => void)[] } = {};

    public on = (eventName: string, fn: (...args: any[]) => void): void => {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName]?.push(fn);
    };

    public off = (eventName: string, fn: (...args: any[]) => void): void => {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName]!.filter(cur => cur !== fn);
        }
    };

    public emit = (eventName: string, data?: any): void => {
        if (this.events[eventName]) {
            this.events[eventName]?.forEach(fn => {
                fn(data);
            });
        }
    };
}

export default EventEmitter;
