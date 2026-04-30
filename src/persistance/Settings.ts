import {BookmarkDAO} from "./Bookmarks.ts";

export interface ISettings {
    sort: "from-bookmarks" | "alphabetical" | "recent",
    foldersFirst: boolean,
    foregroundColor: string,
    backgroundColor: string,
    modalForegroundColor: string,
    modalBackgroundColor: string,
    modalBorderColor: string,
    enableDragging: boolean,
    editMode: boolean,
    rootFolder: string,
    keepFoldersOpen: boolean
}

export let defaultSettings: ISettings = {
    sort: "from-bookmarks",
    foldersFirst: true,
    foregroundColor: 'white',
    backgroundColor: 'rgb(36, 36, 36)',
    modalForegroundColor: 'white',
    modalBackgroundColor: 'rgba(25, 25, 25)',
    modalBorderColor: 'rgba(255, 255, 255, 0.2)',
    enableDragging: true,
    editMode: false,
    rootFolder: BookmarkDAO.ROOT_ID,
    keepFoldersOpen: false
}

class SettingsDAO {
    private static readonly KEY = 'settings'

    static async get(): Promise<ISettings> {
        let data = Object.values(await browser.storage.sync.get(this.KEY)).at(0);
        return data ? JSON.parse(data) : defaultSettings
    }

    static async put(settings: ISettings) {
        let data = JSON.stringify(settings)
        return browser.storage.sync.set({[this.KEY]: data});
    }
}

export {SettingsDAO}

