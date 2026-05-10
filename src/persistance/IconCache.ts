interface IconCacheEntry {
    icon?: IconInfo,
    setByUser: boolean,
    source: "google" | "site" | "letter" | "custom"
}

interface IconInfo {
    url?: string,
    hash?: string
    data: string,
    size: number
}

class IconCacheDAO {
    private static readonly KEY = (id: string) => `icon-cache-${id}`

    private static changeListeners: ((id: string) => void)[] = [];

    static async get(id: string): Promise<IconCacheEntry | undefined> {
        let data = Object.values(await browser.storage.local.get(this.KEY(id))).at(0);
        return data ? JSON.parse(data) : undefined;
    }

    static async put(id: string, entry: IconCacheEntry) {
        let data = JSON.stringify(entry);
        let r = await browser.storage.local.set({[this.KEY(id)]: data});
        this.changeListeners.forEach(ch => ch(id));
        return r;
    }

    static registerChangedListener(id: string, action: () => void) {
        let change = (cId: string) => {
            if (id !== cId) return;
            action();
        }

        this.changeListeners.push(change)

        const deregister = () => {
            this.changeListeners = this.changeListeners.filter(i => i !== change)
        }

        return { deregister }
    }

    static async clearAll() {
        let keys = await browser.storage.local.getKeys();
        let tasks = keys.map(async (key) => {
            if (!key.includes(this.KEY(''))) {
                return;
            }
            await browser.storage.local.remove(key)

            let id = key.match(/^icon-cache-(.+)/)?.[1]
            if (id) {
                this.changeListeners.forEach(i => i(id))
            }
        })
        await Promise.all(tasks)
    }
}

export {IconCacheDAO, type IconCacheEntry, type IconInfo};