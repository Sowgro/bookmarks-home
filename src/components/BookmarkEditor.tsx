import IconPicker from "./IconPicker.tsx";
import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import {BookmarkDAO} from "../persistance/Bookmarks.ts";

function BookmarkEditor(props: {bmData: BookmarkTreeNode}) {

    function updateBookmark(newData: {}) {
        console.log("updated bookmark") // TODO toast this
        BookmarkDAO.update(props.bmData.id, newData)
    }

    let isFolder = !props.bmData.url

    return (<>
        <h1>Edit {isFolder ? "Folder" : "Bookmark"}</h1>

        <h3>Info</h3>

        <label>
            Name
            <input
                type={"text"}
                defaultValue={props.bmData.title}
                onBlur={e => updateBookmark({title: e.target.value})}
            />
        </label>

        {!isFolder && (<>
            <label>
                URL
                <input
                    type={"url"}
                    defaultValue={props.bmData.url}
                    onBlur={e => updateBookmark({url: e.target.value})}
                />
            </label>

            <h3>Icon</h3>
            <IconPicker key={props.bmData.id} bmData={props.bmData}/>
        </>)}
    </>)
}

export default BookmarkEditor;