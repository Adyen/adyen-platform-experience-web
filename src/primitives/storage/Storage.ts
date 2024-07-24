class SessionStorage<T> {
    private readonly prefix = 'adyen-pe-';
    private readonly key: string;
    private storage: Storage;

    constructor(key: string, storage = window.localStorage) {
        this.storage = storage;
        this.key = this.prefix + key;
    }

    public get(): T | null {
        const storageItem = this.storage.getItem(this.key);
        if (storageItem) {
            try {
                return JSON.parse(storageItem);
            } catch (err) {
                return null;
            }
        }
        return null;
    }

    public set(value: T) {
        this.storage.setItem(this.key, JSON.stringify(value));
    }

    public remove() {
        this.storage.removeItem(this.key);
    }
}

export default SessionStorage;
