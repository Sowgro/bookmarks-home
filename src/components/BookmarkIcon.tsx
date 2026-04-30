import React, {SyntheticEvent, useEffect, useState} from "react";
import ColorThief from "colorthief";
import {getIconInfo} from "../util/IconProvider.ts";
import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import {IconCacheDAO, IconInfo} from "../persistance/IconCache.ts";

// from bookmark data
function BookmarkIcon(props: {bmData: BookmarkTreeNode}) {
    const [iconInfo, setIconInfo] = useState<IconInfo | undefined>(undefined)

    function updateIconInfo() {
        getIconInfo(props.bmData).then(r => setIconInfo(r))
    }

    useEffect(() => {
        let changeListener = IconCacheDAO.registerChangedListener(props.bmData.id, () => {
            updateIconInfo();
        })
        updateIconInfo();

        return () => changeListener.deregister();
    }, []);

    return iconInfo
        ? (<AutoBookmarkIcon imgSrc={iconInfo.data} size={iconInfo.size}/>)
        : (<LetterBookmarkIcon text={new URL(props.bmData.url!).hostname}/>)
}

// auto small or large
function AutoBookmarkIcon(props: {imgSrc: string, size: number}) {
    return (props.size ?? 100) < 75
        ? (<SmallBookmarkIcon imgSrc={props.imgSrc}/>)
        : (<LargeBookmarkIcon imgSrc={props.imgSrc}/>);
}

function LargeBookmarkIcon(props: {imgSrc: string}) {
    return (
        <div className={"icon-box " + 'large'}>
            <img alt="Bookmark icon" src={props.imgSrc}/>
        </div>
    )
}

function SmallBookmarkIcon(props: {imgSrc: string}) {
    let [bgColor, setBgColor] = React.useState<[number, number, number] | null>(null)

    function handleImageLoad(e: SyntheticEvent<HTMLImageElement, Event>) {
        if (!bgColor) {
            setBgColor(new ColorThief().getColor(e.currentTarget));
        }
    }

    return (
        <div
            className={"icon-box " + 'small'}
            style={bgColor ? {"--icon-bg": `rgba(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]}, 0.2)`} as React.CSSProperties : undefined}
        >
            <img alt="Bookmark icon" src={props.imgSrc} onLoad={handleImageLoad}/>
        </div>
    )
}

function LetterBookmarkIcon(props: {text?: string}) {
    let bgColor = hashStringToColor(props.text || "?")

    return (
        <div
            className={"icon-box " + 'letter'}
            style={bgColor ? {"--icon-bg": `rgba(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]}, 0.2)`} as React.CSSProperties : undefined}
        >
            <span className={"letter"}>{(props.text || '?')[0]}</span>
        </div>
    )
}

function hashStringToColor(str: string): [number, number, number] {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }

    let r = (hash & 0xFF0000) >> 16;
    let g = (hash & 0x00FF00) >> 8;
    let b = hash & 0x0000FF;
    return [r, g, b];
}

export { BookmarkIcon, AutoBookmarkIcon, LetterBookmarkIcon };