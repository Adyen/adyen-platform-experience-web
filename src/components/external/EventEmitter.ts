class EventEmitter {
    public events: { [key: string]: Function[] } = {};

    public on = (eventName: string, fn: Function): void => {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName]?.push(fn);
    };

    public off = (eventName: string, fn: Function): void => {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName]!.reduce((acc, cur) => {
                if (cur !== fn) acc.push(cur);
                return acc;
            }, [] as Function[]);
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
