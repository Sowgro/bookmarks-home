import RadioButtonGroup from "./RadioButtonGroup.tsx";
import React, {useContext, useEffect, useState} from "react";
import {Settings} from "./Context.tsx";
import {defaultSettings, SettingsDAO} from "../persistance/Settings.ts";
import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import {IconCacheDAO} from "../persistance/IconCache.ts";
import {BookmarkDAO} from "../persistance/Bookmarks.ts";

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

        <h3>Sort</h3>
        <RadioButtonGroup
            value={settings.sort}
            onChange={e => patchSettings({sort: e})}
        >
            <option value={"from-bookmarks"}>Custom Order</option>
            <option value={"alphabetical"}>Alphabetical</option>
            {isChrome &&
                (<option value={"recent"}>Recently used</option>)
            }
        </RadioButtonGroup>
        <br/>
        <label>
            <input
                type={"checkbox"}
                checked={settings.foldersFirst}
                onChange={e => patchSettings({foldersFirst: e.target.checked})}
            />
            Sort Folders First
        </label>

        <h3>Colors</h3>
        <label>
            Foreground:
            <input
                type={"color"}
                value={settings.foregroundColor}
                onChange={e => patchSettings({foregroundColor: e.target.value}, false)}
                onBlur={saveSettings}
            />
        </label>
        <label>
            Background:
            <input
                type={"color"}
                value={settings.backgroundColor}
                onChange={e => patchSettings({backgroundColor: e.target.value}, false)}
                onBlur={saveSettings}
            />
        </label>
        <label>
            Folder foreground:
            <input
                type={"color"}
                value={settings.modalForegroundColor}
                onChange={e => patchSettings({modalForegroundColor: e.target.value}, false)}
                onBlur={saveSettings}
            />
        </label>
        <label>
            Folder background:
            <input
                type={"color"}
                value={settings.modalBackgroundColor}
                onChange={e => patchSettings({modalBackgroundColor: e.target.value}, false)}
                onBlur={saveSettings}
            />
        </label>
        <label>
            Folder border:
            <input
                type={"color"}
                value={settings.modalBorderColor}
                onChange={e => patchSettings({modalBorderColor: e.target.value}, false)}
                onBlur={() => saveSettings()}
            />
        </label>
        <br/>
        <button
            className={"default"}
            onClick={resetDefaultColors}
        >
            Reset default colors
        </button>

        <h3>Root folder</h3>
        <select
            value={settings.rootFolder!}
            onChange={e => patchSettings({rootFolder: e.target.value})}
        >
            {folders.map(i =>
                <option value={i.id}>{getFolderDisplay(i)}</option>
            )}
        </select>

        <h3>Icon Cache</h3>
        <button
            className={"default"}
            onClick={_ => IconCacheDAO.clearAll()}
        >
            Clear Icon Cache
        </button>

        <h3>Items</h3>
        <label>
            <input
                type={"checkbox"}
                checked={settings.enableDragging}
                onChange={e => patchSettings({enableDragging: e.target.checked})}
            />
            Enable dragging links
        </label>
        <label>
            <input
                type={"checkbox"}
                checked={settings.editMode}
                onChange={e => patchSettings({editMode: e.target.checked})}
            />
            Enable editing items
        </label>

        <h3>Open Folders</h3>
        <label>
            <input
                type={"checkbox"}
                checked={settings.keepFoldersOpen}
                onChange={e => patchSettings({keepFoldersOpen: e.target.checked})}
            />
            Keep folders open
        </label>
    </>)
}

export default SettingsEditor;