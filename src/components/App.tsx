import React, {useContext, useEffect, useState} from "react";
import SettingsEditor from "./SettingsEditor.tsx";
import SettingsIcon from "../assets/settings.svg?react";
import FolderBody from "./FolderBody.tsx";
import {SettingsDAO} from "../persistance/Settings.ts";
import {OpenFolders, Settings, SidebarContent} from "./Context.tsx";
import CloseIcon from "../assets/close.svg?react"
import SwapIcon from "../assets/swap.svg?react"
import {OpenFoldersDAO} from "../persistance/OpenFolders.ts";

// Mounted on the body
function App() {
    const [, setSidebarContent] = useContext(SidebarContent)
    const [settings, setSettings] = useContext(Settings);
    const [openFolders, setOpenFolders] = useContext(OpenFolders);

    useEffect(() => {
        SettingsDAO.get().then(r => setSettings(r));
    }, [])

    useEffect(() => {
        if (!settings) return;

        if (!openFolders) {
            if (settings.keepFoldersOpen) {
                OpenFoldersDAO.get().then(r => setOpenFolders(r))
            } else {
                setOpenFolders([])
            }
        }

        const css = document.documentElement.style
        css.setProperty('--background', settings.backgroundColor);
        css.setProperty('--foreground', settings.foregroundColor);
        css.setProperty('--modal-border', settings.modalBorderColor);
        css.setProperty('--modal-foreground', settings.modalForegroundColor)
        css.setProperty('--modal-background', settings.modalBackgroundColor);
    }, [settings]);

    if (!settings || !openFolders) return;

    return (
        <>
            <div className={"action-area"}>
                <button
                    className={"icon-button"}
                    onClick={() => setSidebarContent(<SettingsEditor/>)}
                >
                    <SettingsIcon/>
                </button>
            </div>
            <Sidebar/>
            <FolderBody id={settings.rootFolder || '0'}/>
        </>
    )
}

function Sidebar() {
    const [sidebarContent, setSidebarContent] = useContext(SidebarContent)

    const [swapSides, setSwapSides] = useState(false)

    let open = !!sidebarContent

    return (
        <div className={`sidebar ${open ? 'open' : ''} ${swapSides ? 'swap-sides' : ''}`}>
            <div className={'action-area'}>
                <button
                    className={"icon-button"}
                    onClick={() => setSwapSides(!swapSides)}
                >
                    <SwapIcon/>
                </button>
                <button
                    className={"icon-button"}
                    onClick={() => setSidebarContent(null)}
                >
                    <CloseIcon/>
                </button>
            </div>
            {sidebarContent}
        </div>
    )
}

export default App