import FolderBody from "./FolderBody.tsx";
import React, {RefObject, useEffect, useState} from "react";
import {BookmarkDAO} from "../persistance/Bookmarks.ts";

function FolderModal(props: {id: string, folderRef: RefObject<HTMLDivElement | null>, zIndex: number, onClose: () => void}) {
    const [viewportDims, setViewportDims] = useState<undefined | {x: number, y: number}>();
    const [childrenCount, setChildrenCount] = useState(0)

    useEffect(() => {
        let handleResize = () => setViewportDims({x: window.innerWidth, y: window.innerHeight});
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let handleChildrenChange = () => {
            BookmarkDAO.getChildren(props.id).then(r => {
                setChildrenCount(r.length)
            })
        }
        let changeListener = BookmarkDAO.registerOnChildrenChanged(props.id, handleChildrenChange)
        handleChildrenChange();

        return () => changeListener.deregister();
    }, []);

    if (!props.folderRef.current || !viewportDims) return;

    let modalPosition = (() => {
        let folderButtonElem = props.folderRef.current;
        let itemWidth = /*folderButtonElem.offsetWidth*/ 145;
        let itemCount = childrenCount;
        let maxFolderWidth = viewportDims.x - /*folderButtonElem.getBoundingClientRect().left*/20;
        let maxItemsPerRow = Math.floor(maxFolderWidth / itemWidth)
        let itemsPerRow = Math.min(itemCount, maxItemsPerRow);
        let distanceAfterButton = (maxFolderWidth - folderButtonElem.getBoundingClientRect().left) + 20;
        let maxItemsAfterButton = Math.floor(distanceAfterButton / itemWidth);
        let itemsAfterButton = Math.min(itemCount, maxItemsAfterButton)
        let itemsBeforeButton = (itemsPerRow - itemsAfterButton)
        return {
            width: itemWidth * itemsPerRow + 4,
            top: folderButtonElem.offsetTop + folderButtonElem.offsetHeight + 8,
            left: folderButtonElem.offsetLeft - itemsBeforeButton * itemWidth - 11
        };
    })();

    return (
        <>
            <div
                className="folder-modal-overlay"
                style={{zIndex: props.zIndex}}
                onClick={props.onClose}
            />
            { !!childrenCount &&
                <div
                    className="folder-modal"
                    style={{
                        top: modalPosition.top,
                        left: modalPosition.left,
                        width: modalPosition.width,
                        zIndex: props.zIndex + 1
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <FolderBody id={props.id}/>
                </div>
            }
        </>
    );
}

export default FolderModal