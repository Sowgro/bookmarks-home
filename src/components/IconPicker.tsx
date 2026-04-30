import BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode;
import React, {ReactNode, useEffect, useRef, useState} from "react";
import {AutoBookmarkIcon, LetterBookmarkIcon} from "./BookmarkIcon.tsx";
import Check from "../assets/check.svg?react"
import {
    fileToDataUrl,
    getGoogleIcon,
    getImageDimensions,
    GoogleIconInfo,
    hashImage,
    urlToDataUrl
} from "../util/IconUtils.ts";
import {IconAvalDAO, IconAvalEntry} from "../persistance/IconAval.ts";
import {IconCacheDAO, IconCacheEntry} from "../persistance/IconCache.ts";

interface ImageUploadInfo {
    data: string,
    size: number,
    hash: string
}

function IconPicker(props: {bmData: BookmarkTreeNode}) {
    const [iconsAval, setIconsAval] = useState<IconAvalEntry[]>([]);
    const [iconCache, setIconCache] = useState<IconCacheEntry | undefined>(undefined);
    const [uploadedImages, setUploadedImages] = useState<ImageUploadInfo[]>([])
    const [googleIcon, setGoogleIcon] = useState<GoogleIconInfo | undefined>(undefined)

    const uploadedImagesWasInit = useRef(false)

    let refreshCache = () => {
        IconCacheDAO.get(props.bmData.id).then(r => r && setIconCache(r))
    }

    useEffect(() => {
        refreshCache();
        IconAvalDAO.get(props.bmData.id).then(r => r && setIconsAval(r))
        getGoogleIcon(props.bmData.url!).then(r => r && setGoogleIcon(r))
    }, []);

    useEffect(() => {
        if (iconCache && !uploadedImagesWasInit.current) {
            if (iconCache?.source === 'custom') {
                setUploadedImages([{
                    data: iconCache.icon!.data,
                    size: iconCache.icon!.size,
                    hash: iconCache.icon!.hash!
                }])
            }
            uploadedImagesWasInit.current = true;
        }
    }, [iconCache]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        if (!e.target.files || !e.target.files.length) {
            return;
        }
        let file = e.target.files[0];

        let data = await fileToDataUrl(file);
        let r = {
            data,
            size: (await getImageDimensions(data)).width,
            hash: await hashImage(data)
        }
        setUploadedImages([...uploadedImages, r])
    };

    let handleSelectSite = async (i: IconAvalEntry) => {
        await IconCacheDAO.put(props.bmData.id, {
            icon: {
                url: i.url,
                data: await urlToDataUrl(i.url),
                size: i.size
            },
            setByUser: true,
            source: 'site'
        })
        refreshCache();
    }

    let handleSelectLetter = async () => {
        await IconCacheDAO.put(props.bmData.id, {
            icon: undefined,
            setByUser: true,
            source: "letter"
        })
        refreshCache();
    }

    let handleSelectCustom = async (i: ImageUploadInfo) => {
        await IconCacheDAO.put(props.bmData.id, {
            icon: {
                data: i.data,
                hash: i.hash,
                size: i.size
            },
            setByUser: true,
            source: 'custom'
        })
        refreshCache();
    }

    let handleSelectGoogle = async () => {
        await IconCacheDAO.put(props.bmData.id, {
            icon: {
                data: await urlToDataUrl(googleIcon!.url),
                url: googleIcon!.url,
                size: googleIcon!.size
            },
            setByUser: true,
            source: "google"
        })
        refreshCache();
    }

    return (<>
        <div className={"icon-selector"}>
            <IconOption
                isSelected={!iconCache?.icon}
                onSelect={handleSelectLetter}
            >
                <LetterBookmarkIcon text={new URL(props.bmData.url!).hostname}/>
            </IconOption>
            {googleIcon && (
                <IconOption
                    isSelected={iconCache?.icon?.url === googleIcon.url}
                    onSelect={handleSelectGoogle}
                >
                    <AutoBookmarkIcon imgSrc={googleIcon.url} size={googleIcon.size}/>
                </IconOption>
            )}
            {iconsAval.map(i =>
                <IconOption
                    isSelected={iconCache?.icon?.url === i.url}
                    onSelect={() => handleSelectSite(i)}
                >
                    <AutoBookmarkIcon imgSrc={i.url} size={i.size}/>
                </IconOption>
            )}
            {uploadedImages.map(i =>
                <IconOption
                    isSelected={iconCache?.icon?.hash === i.hash}
                    onSelect={() => handleSelectCustom(i)}
                >
                    <AutoBookmarkIcon imgSrc={i.data} size={i.size}/>
                </IconOption>
            )}
        </div>
        {!iconsAval.length && (
            <span className={'note'}>More icons may appear after loading the page.</span>
        )}
        <h4>Custom</h4>
        <input type={"file"} accept={"image/*"} className={"default"} name={"Upload"} onChange={handleImageUpload}/>
    </>)
}

function IconOption(props: {children: ReactNode, isSelected: boolean, onSelect: () => void}) {
    return (
        <div className={"icon-option"} onClick={props.onSelect}>
            {props.children}
            {props.isSelected &&
                <div className={"selected"}>
                    <Check/>
                </div>
            }
        </div>
    )
}

export default IconPicker;