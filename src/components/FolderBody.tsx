import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import {useContext, useEffect, useState} from "react";
import {Settings} from "./Context.tsx";
import Bookmark from "./Bookmark.tsx";
import FolderButton from "./FolderButton.tsx";
import {BookmarkDAO} from "../persistance/Bookmarks.ts";

function FolderBody(props: {id: string}) {
    const [settings, ] = useContext(Settings)

    const [children, setChildren] = useState<BookmarkTreeNode[]>([])

    const updateBookmarks = () => {
        BookmarkDAO.getChildren(props.id).then(r => {
            r.sort(getSortFunction(settings.sort))
            r.sort(settings.foldersFirst ? foldersFirst : undefined)
            setChildren(r);
        })
    }

    useEffect(() => {
        let changeListener = BookmarkDAO.registerOnChildrenChanged(props.id, updateBookmarks)
        updateBookmarks();

        return () => changeListener.deregister();
    }, [settings]);

    if (!children.length) return;

    return (
        <div className={"folder-body"}>
            {children.map(child =>
                child.children
                    ? <FolderButton id={child.id} key={child.id}/>
                    : <Bookmark id={child.id} key={child.id}/>
            )}
        </div>
    )
}

const foldersFirst =
    (a: BookmarkTreeNode, b: BookmarkTreeNode) => (!!a.children ? 0 : 1) - (!!b.children ? 0 : 1)

function getSortFunction(sort: string) {
    switch (sort) {
        case "alphabetical":
            return (a: BookmarkTreeNode, b: BookmarkTreeNode) => a.title.localeCompare(b.title)
        case "recent":
            return (a: BookmarkTreeNode, b: BookmarkTreeNode) => (a as any).dateLastUsed - (b as any).dateLastUsed
        default:
            return undefined;
    }
}


export default FolderBody;