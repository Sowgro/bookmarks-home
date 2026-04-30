import MoveDestination = chrome.bookmarks.MoveDestination;
import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import _OnRemovedRemoveInfo = browser.bookmarks._OnRemovedRemoveInfo;

interface OnMovedInfo {
    parentId: string
    index: number
    oldParentId: string
    oldIndex: number
}

class BookmarkDAO {
    static readonly ROOT_ID = (browser.bookmarks as any).ROOT_NODE_ID ?? "root________";

    static async get(id: string) {
        return (await browser.bookmarks.get(id)).at(0)
    }

    static async update(id: string, newData: {}) {
        return browser.bookmarks.update(id, newData)
    }

    static async remove(id: string) {
        return browser.bookmarks.remove(id)
    }

    static async removeFolder(id: string) {
        return browser.bookmarks.removeTree(id)
    }

    static async move(id: string, destination: MoveDestination) {
        return browser.bookmarks.move(id, destination)
    }

    static async getChildren(id: string) {
        let r = (await browser.bookmarks.getSubTree(id)).at(0);
        return [...(r?.children ?? [])]
    }

    static async getAllFolders() {
        let tree = await browser.bookmarks.getTree();
        let folderList: BookmarkTreeNode[] = [];
        rec(tree);

        function rec(tree: BookmarkTreeNode[]) {
            tree.forEach(item => {
                if (item.children) {
                    folderList.push(item);
                    rec(item.children);
                }
            })
        }
        return folderList;
    }

    static registerOnChanged(id: string, action: () => void) {
        let change = (id2: string) => {
            if (id2 !== id) return;
            action();
        }

        let moved = () => {
            action();
        }

        browser.bookmarks.onChanged.addListener(change);
        browser.bookmarks.onMoved.addListener(moved);

        let deregister = () => {
            browser.bookmarks.onChanged.removeListener(change);
            browser.bookmarks.onMoved.removeListener(moved);
        }

        return { deregister }
    }

    static registerOnChildrenChanged(id: string, action: () => void) {
        let remove = (_: string, moveInfo: _OnRemovedRemoveInfo) => {
            if (moveInfo.parentId !== id) return;
            action();
        }
        let move = (_: string, moveInfo: OnMovedInfo) => {
            if (moveInfo.parentId !== id && moveInfo.oldParentId !== id ) return;
            action();
        }
        let create = (_: string, moveInfo: BookmarkTreeNode) => {
            if (moveInfo.parentId !== id) return;
            action();
        }

        browser.bookmarks.onRemoved.addListener(remove)
        browser.bookmarks.onMoved.addListener(move)
        browser.bookmarks.onCreated.addListener(create)

        const deregister = () => {
            browser.bookmarks.onRemoved.removeListener(remove)
            browser.bookmarks.onMoved.removeListener(move)
            browser.bookmarks.onCreated.removeListener(create)
        };

        return { deregister }
    }
}

export {BookmarkDAO}