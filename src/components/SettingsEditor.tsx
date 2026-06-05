import React, {useContext, useEffect, useState} from "react";
import {Settings} from "./Context.tsx";
import {defaultSettings, SettingsDAO} from "../persistance/Settings.ts";
import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import {IconCacheDAO} from "../persistance/IconCache.ts";
import {BookmarkDAO} from "../persistance/Bookmarks.ts";
import {IconAvalDAO} from "../persistance/IconAval.ts";

function SettingsEditor() {
    let [settings, setSettings] = useContext(Settings)

    let [folders, setFolders] = useState<BookmarkTreeNode[]>([])

    useEffect(() => {
        BookmarkDAO.getAllFolders().then(r => setFolders(r));
    }, []);

    function saveSettings() {
        console.log("saved settings") // TODO toast this
        SettingsDAO.put(settings);
    }

    function patchSettings(newItems: {}, save: boolean = true) {
        setSettings(settings = {
            ...settings,
            ...newItems
        })
        if (save) {
            saveSettings();
        }
    }

    let getFolderDisplay = (i: BookmarkTreeNode) => {
        if (i.title) {
            return i.title;
        }

        if (i.id == BookmarkDAO.ROOT_ID) {
            return 'Default'
        }

        return `Untitled (id: ${i.id})`
    }

    let resetDefaultColors = () => {
        patchSettings({
            foregroundColor: defaultSettings.foregroundColor,
            backgroundColor: defaultSettings.backgroundColor,
            modalForegroundColor: defaultSettings.modalForegroundColor,
            modalBackgroundColor: defaultSettings.modalBackgroundColor,
            modalBorderColor: defaultSettings.modalBorderColor,
        })
    }

    let isChrome = navigator.userAgent.includes("Chrome")

    return (<>
        <h1>Settings</h1>

        <h3>Bookmarks</h3>
        <label>
            Root Folder
            <select
                value={settings.rootFolder!}
                onChange={e => patchSettings({rootFolder: e.target.value})}
            >
                {folders.map(i =>
                    <option value={i.id}>{getFolderDisplay(i)}</option>
                )}
            </select>
        </label>

        <label>
            Sort
            <select
                value={settings.sort}
                onChange={e => patchSettings({sort: e})}
            >
                <option value={"from-bookmarks"}>Custom Order</option>
                <option value={"alphabetical"}>Alphabetical</option>
                {isChrome &&
                    (<option value={"recent"}>Recently used</option>)
                }
            </select>
        </label>

        <label>
            Folders First
            <input
                type={"checkbox"}
                checked={settings.foldersFirst}
                onChange={e => patchSettings({foldersFirst: e.target.checked})}
            />
        </label>

        <h3>Colors</h3>
        <label>
            Foreground
            <input
                type={"color"}
                value={settings.foregroundColor}
                onChange={e => patchSettings({foregroundColor: e.target.value}, false)}
                onBlur={saveSettings}
            />
        </label>
        <label>
            Background
            <input
                type={"color"}
                value={settings.backgroundColor}
                onChange={e => patchSettings({backgroundColor: e.target.value}, false)}
                onBlur={saveSettings}
            />
        </label>
        <label>
            Folder foreground
            <input
                type={"color"}
                value={settings.modalForegroundColor}
                onChange={e => patchSettings({modalForegroundColor: e.target.value}, false)}
                onBlur={saveSettings}
            />
        </label>
        <label>
            Folder background
            <input
                type={"color"}
                value={settings.modalBackgroundColor}
                onChange={e => patchSettings({modalBackgroundColor: e.target.value}, false)}
                onBlur={saveSettings}
            />
        </label>
        <label>
            Folder border
            <input
                type={"color"}
                value={settings.modalBorderColor}
                onChange={e => patchSettings({modalBorderColor: e.target.value}, false)}
                onBlur={() => saveSettings()}
            />
        </label>
        <label>
            <div/>
            <button onClick={resetDefaultColors}>
                Reset
            </button>
        </label>


        <h3>Behavior</h3>
        <label>
            Enable dragging links
            <input
                type={"checkbox"}
                checked={settings.enableDragging}
                onChange={e => patchSettings({enableDragging: e.target.checked})}
            />
        </label>
        <label>
            Enable editing items
            <input
                type={"checkbox"}
                checked={settings.editMode}
                onChange={e => patchSettings({editMode: e.target.checked})}
            />
        </label>
        <label>
            Remember open folders
            <input
                type={"checkbox"}
                checked={settings.keepFoldersOpen}
                onChange={e => patchSettings({keepFoldersOpen: e.target.checked})}
            />
        </label>

        <h3>Data</h3>
        <label>
            Default icons
            <button onClick={_ => IconCacheDAO.clearAll()}>
                Reset
            </button>
        </label>

        <label>
            Collected icons
            <button onClick={_ => IconAvalDAO.clearAll()}>
                Clear
            </button>
        </label>

    </>)
}

export default SettingsEditor;