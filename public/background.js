browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    let {siteUrl, foundIcons} = request;
    console.debug("request received:", request)

    let hostname = new URL(siteUrl).hostname;
    let bmk = (await browser.bookmarks.search(hostname))
        .filter(i => new URL(i.url).hostname === hostname)
        .at(0);

    if (bmk) {
        const obj = { [`icon-aval-2-${hostname}`]: JSON.stringify(foundIcons) };

        await browser.storage.local.set(obj);
        console.debug("set to storage:", obj);
    }

    sendResponse();
})
