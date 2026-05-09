import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import {getGoogleIcon, imgUrlToDataUrl, resizeDataUrl} from "./IconUtils.ts";
import {IconCacheDAO, IconInfo} from "../persistance/IconCache.ts";
import {IconAvalDAO} from "../persistance/IconAval.ts";

async function getIconInfo(bmData: BookmarkTreeNode): Promise<IconInfo | undefined> {
    let cache = await IconCacheDAO.get(bmData.id);

    if (!cache) {
        return await bestIconFromSite(bmData) || await iconFromGoogle(bmData)
    }

    if (!cache.setByUser) {
        let r = await bestIconFromSite(bmData)
        if (r) return r;
    }

    return cache.icon;
}

async function bestIconFromSite(bmData: BookmarkTreeNode): Promise<IconInfo | undefined> {
    let icons_aval = await IconAvalDAO.getFromUrl(bmData.url!);
    if (!icons_aval || !icons_aval.length) {
        return undefined
    }

    let iconAval = icons_aval[0];
    let dataUrl = await imgUrlToDataUrl(iconAval.url);
    if (!dataUrl) {
        return undefined
    }
    dataUrl = await resizeDataUrl(dataUrl);

    let iconInfo = {
        url: iconAval.url,
        data: dataUrl,
        size: iconAval.size
    }
    IconCacheDAO.put(bmData.id, {
        icon: iconInfo,
        setByUser: false,
        source: "site"
    })
    return iconInfo;
}

async function iconFromGoogle(bmData: BookmarkTreeNode): Promise<IconInfo | undefined> {
    let googleIcon = await getGoogleIcon(bmData.url!)
    if (!googleIcon) {
        return undefined
    }

    let dataUrl = await imgUrlToDataUrl(googleIcon.url);
    if (!dataUrl) {
        return undefined
    }
    dataUrl = await resizeDataUrl(dataUrl);

    let iconInfo = {
        data: dataUrl,
        url: googleIcon.url,
        size: googleIcon.size
    }
    IconCacheDAO.put(bmData.id, {
        icon: iconInfo,
        setByUser: false,
        source: "google"
    })
    return iconInfo
}

export { getIconInfo }