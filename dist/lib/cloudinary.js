"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHtmlImagesToCloudinary = exports.getCloudinaryUrl = exports.createPublicId = exports.configureCloudinary = exports.getCloudinary = void 0;
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const jsdom_1 = require("jsdom");
const cloudinary_1 = require("cloudinary");
const util_1 = require("./util");
const errors_1 = require("../data/errors");
/**
 * getCloudinary
 */
function getCloudinary(config) {
    if (!config)
        return cloudinary_1.v2;
    return configureCloudinary(config);
}
exports.getCloudinary = getCloudinary;
/**
 * configureCloudinary
 */
function configureCloudinary(config) {
    cloudinary_1.v2.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
    });
    return cloudinary_1.v2;
}
exports.configureCloudinary = configureCloudinary;
/**
 * createPublicId
 */
async function createPublicId({ path: filePath }) {
    const hash = crypto_1.default.createHash('md5');
    const { name: imgName } = path_1.default.parse(filePath);
    if (!(0, util_1.isRemoteUrl)(filePath)) {
        hash.update(filePath);
    }
    else {
        const response = await (0, node_fetch_1.default)(filePath);
        const buffer = await response.buffer();
        hash.update(buffer);
    }
    const digest = hash.digest('hex');
    return `${imgName}-${digest}`;
}
exports.createPublicId = createPublicId;
/**
 * getCloudinaryUrl
 */
async function getCloudinaryUrl(options) {
    const { deliveryType, folder, path: filePath, localDir, remoteHost, uploadPreset, } = options;
    const { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, } = cloudinary_1.v2.config();
    const canSignUpload = apiKey && apiSecret;
    if (!cloudName) {
        throw new Error(errors_1.ERROR_CLOUD_NAME_REQUIRED);
    }
    if (deliveryType === 'upload' && !canSignUpload && !uploadPreset) {
        throw new Error(`To use deliveryType ${deliveryType}, please use an uploadPreset for unsigned requests or an API Key and Secret for signed requests.`);
    }
    let fileLocation;
    let publicId;
    if (deliveryType === 'fetch') {
        // fetch allows us to pass in a remote URL to the Cloudinary API
        // which it will cache and serve from the CDN, but not store
        fileLocation = (0, util_1.determineRemoteUrl)(filePath, remoteHost);
        publicId = fileLocation;
    }
    else if (deliveryType === 'upload') {
        // upload will actually store the image in the Cloudinary account
        // and subsequently serve that stored image
        // If our image is locally sourced, we need to obtain the full
        // local relative path so that we can tell Cloudinary where
        // to upload from
        let fullPath = filePath;
        if (!(0, util_1.isRemoteUrl)(fullPath)) {
            fullPath = path_1.default.join(localDir ?? '', fullPath);
        }
        const id = await createPublicId({
            path: fullPath,
        });
        const uploadOptions = {
            folder,
            public_id: id,
            overwrite: false,
        };
        if (uploadPreset) {
            uploadOptions.upload_preset = uploadPreset;
        }
        let results;
        if (canSignUpload) {
            // We need an API Key and Secret to use signed uploading
            results = await cloudinary_1.v2.uploader.upload(fullPath, {
                ...uploadOptions,
            });
        }
        else {
            // If we want to avoid signing our uploads, we don't need our API Key and Secret,
            // however, we need to provide an uploadPreset
            results = await cloudinary_1.v2.uploader.unsigned_upload(fullPath, uploadPreset, {
                ...uploadOptions,
            });
        }
        // Finally use the stored public ID to grab the image URL
        const { public_id } = results;
        publicId = public_id;
        fileLocation = fullPath;
    }
    const cloudinaryUrl = cloudinary_1.v2.url(publicId, {
        type: deliveryType,
        secure: true,
        transformation: [
            {
                fetch_format: 'auto',
                quality: 'auto',
            },
        ],
    });
    return {
        sourceUrl: fileLocation,
        cloudinaryUrl,
        publicId,
    };
}
exports.getCloudinaryUrl = getCloudinaryUrl;
/**
 * updateHtmlImagesToCloudinary
 */
// function to check for assets previously build by Cloudinary
function getAsset(imgUrl, assets) {
    const cloudinaryAsset = assets &&
        Array.isArray(assets.images) &&
        assets.images.find(({ publishPath, publishUrl } = {}) => {
            return [publishPath, publishUrl].includes(imgUrl);
        });
    return cloudinaryAsset;
}
async function updateHtmlImagesToCloudinary(html, options) {
    const { assets, deliveryType, uploadPreset, folder, localDir, remoteHost, loadingStrategy = 'lazy', } = options;
    const errors = [];
    const dom = new jsdom_1.JSDOM(html);
    // Loop through all images found in the DOM and swap the source with
    // a Cloudinary URL
    const images = Array.from(dom.window.document.querySelectorAll('img'));
    for (const $img of images) {
        const imgSrc = $img.getAttribute('src'); // @TODO can this be really be null at this point?
        let cloudinaryUrl;
        // Check to see if we have an existing asset already to pick from
        // Look at both the path and full URL
        const asset = getAsset(imgSrc, assets);
        if (asset && deliveryType === 'upload') {
            cloudinaryUrl = asset.cloudinaryUrl;
        }
        // If we don't have an asset and thus don't have a Cloudinary URL, create
        // one for our asset
        if (!cloudinaryUrl) {
            try {
                const { cloudinaryUrl: url } = await getCloudinaryUrl({
                    deliveryType,
                    folder,
                    path: imgSrc,
                    localDir,
                    uploadPreset,
                    remoteHost,
                });
                cloudinaryUrl = url;
            }
            catch (e) {
                if (e instanceof Error) {
                    errors.push({
                        imgSrc,
                        message: e.message
                    });
                }
                continue;
            }
        }
        $img.setAttribute('src', cloudinaryUrl);
        $img.setAttribute('loading', loadingStrategy);
        // convert srcset images to cloudinary
        const srcset = $img.getAttribute('srcset');
        if (srcset) {
            // convert all srcset urls to cloudinary urls using getCloudinaryUrl function in a Promise.all
            const srcsetUrls = srcset.split(',').map(url => url.trim().split(' '));
            const srcsetUrlsPromises = srcsetUrls.map(url => {
                const exists = getAsset(url[0], assets);
                if (exists && deliveryType === 'upload') {
                    return exists.cloudinaryUrl;
                }
                return getCloudinaryUrl({
                    deliveryType,
                    folder,
                    path: url[0],
                    localDir,
                    uploadPreset,
                    remoteHost,
                });
            });
            const srcsetUrlsCloudinary = await Promise.all(srcsetUrlsPromises);
            const srcsetUrlsCloudinaryString = srcsetUrlsCloudinary
                .map((urlCloudinary, index) => `${urlCloudinary.cloudinaryUrl} ${srcsetUrls[index][1]}`)
                .join(', ');
            $img.setAttribute('srcset', srcsetUrlsCloudinaryString);
        }
        // Look for any preload tags that reference the image URLs. A specific use case here
        // is Next.js App Router hen using the Image component.
        const $preload = dom.window.document.querySelector(`link[rel="preload"][as="image"][href="${imgSrc}"]`);
        if ($preload) {
            $preload.setAttribute('href', cloudinaryUrl);
        }
    }
    return {
        html: dom.serialize(),
        errors,
    };
}
exports.updateHtmlImagesToCloudinary = updateHtmlImagesToCloudinary;
