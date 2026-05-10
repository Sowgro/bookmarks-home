// NOTE: Used externally
interface IconAvalEntry {
    url: string,
    size: number
}

class IconAvalDAO {
    // NOTE: Used externally
    private static readonly KEY = (host: string) => `icon-aval-2-${host}`

    static getFromUrl(url: string) {
        let obj = new URL(url);
        return this.get(obj.hostname)
    }

    static async get(host: string): Promise<IconAvalEntry[] | undefined> {
        let data = Object.values(await browser.storage.local.get(this.KEY(host))).at(0)
        return data ? JSON.parse(data) : undefined
    }

    static async clearAll() {
        let keys = await browser.storage.local.getKeys();
        let tasks = keys.map(async (key) => {
            if (!key.includes(this.KEY(''))) {
                return;
            }
            await browser.storage.local.remove(key)
        })
        await Promise.all(tasks)
    }
}

export {IconAvalDAO, type IconAvalEntry}