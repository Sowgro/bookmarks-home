async function imgUrlToDataUrl(url: string): Promise<string | undefined> {
    let response = await fetch(url);
    if (!response.ok) {
        return undefined;
    }

    let blob: Blob = await response.blob();
    return await fileToDataUrl(blob)
}

async function fileToDataUrl(file: Blob): Promise<string | undefined> {
    return await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as any)
        reader.onerror = () => resolve(undefined)
        reader.readAsDataURL(file);
    })
}

function getImageDimensions(url: string): Promise<{width: number, height: number} | undefined> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({width: img.naturalWidth, height: img.naturalHeight});
        img.onerror = () => resolve(undefined);
        img.src = url;
    });
}

async function hashImage(dataUrl: string): Promise<string> {
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface GoogleIconInfo {
    url: string
    size: number
}

async function getGoogleIcon(siteUrl: string): Promise<GoogleIconInfo | undefined> {
    const url = new URL('https://www.google.com/s2/favicons');
    url.searchParams.set("sz", "256");
    url.searchParams.set("domain_url", new URL(siteUrl).origin);
    let resp = await fetch(url)
    if (!resp.ok) {
        return undefined;
    }

    let r = url.toString()
    let imgDim = await getImageDimensions(r);
    if (!imgDim) {
        return undefined;
    }

    return {
        url: r,
        size: imgDim.width
    }
}

export {imgUrlToDataUrl, getImageDimensions, fileToDataUrl, hashImage, getGoogleIcon, type GoogleIconInfo}
