import DeleteIcon from "../assets/delete.svg?react";
import EditIcon from "../assets/edit.svg?react";
import MoreIcon from "../assets/more.svg?react";
import React, {useEffect, useState} from "react";
import {Settings, SidebarContent} from "./Context.tsx";
import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import BookmarkEditor from "./BookmarkEditor.tsx";
import {BookmarkDAO} from "../persistance/Bookmarks.ts";

function ContextMenu(props: {bmData: BookmarkTreeNode, isFolder?: boolean}) {
    let [settings, ] = React.useContext(Settings);
    let [, setSidebarContent] = React.useContext(SidebarContent)

    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (open) {
            let evl = () => {
                open && setOpen(false);
                document.removeEventListener('click', evl);
            }
            document.addEventListener('click', evl);
        }
    }, [open]);

    const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
    }

    const onDelete = (_: any) => {
        setOpen(false);
        if (props.isFolder) {
            let r = window.confirm("Are you sure you want to delete this folder?\nDeleting a folder will delete all of the items inside of it.").valueOf()
            if (r) {
                BookmarkDAO.removeFolder(props.bmData.id);
            }
        } else {
            BookmarkDAO.remove(props.bmData.id);
        }
    };

    const onEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        setOpen(false);
        e.preventDefault();
        setSidebarContent(<BookmarkEditor bmData={props.bmData}/>)
    };

    if (!settings.editMode) return;

    return (
        <div className={"overflow"}>
            <button className={"icon-button"} onClick={onClick}>
                <MoreIcon/>
            </button>
            {open &&
                <div className={"context-menu"}>
                    <button onClick={onEdit}>
                        <EditIcon/>
                        Edit
                    </button>
                    <button className={"del"} onClick={onDelete}>
                        <DeleteIcon/>
                        Delete
                    </button>
                </div>}
        </div>
    )
}

export default ContextMenu;