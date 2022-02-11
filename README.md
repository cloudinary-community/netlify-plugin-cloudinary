# Cloudinary Netlify Plugin

Optimize and serve all images served in your Netlify site deploy with [Cloudinary](https://cloudinary.com/).

**This plugin is not officially supported by Cloudinary.**

- [Getting Started](#%EF%B8%8F-getting-started)
- [Configuration](#-configuration)
- [How it Works](#%EF%B8%8F-how-it-works)

## ⚡️ Getting Started

- Sign up for a free [Cloudinary](https://cloudinary.com/) account.

- Install the plugin:

```shell
npm install netlify-plugin-cloudinary
# or
yarn add netlify-plugin-cloudinary
```

- Add the plugin to your Netlify config:

```toml
[[plugins]]
  package = "netlify-plugin-cloudinary"
```

- Configure your Cloudinary Cloud Name:

```toml
[[plugins]]
  package = "netlify-plugin-cloudinary"

  [plugins.inputs]
  cloudName = "[Your Cloud Name]"
```

By default, your images will served via the [fetch delivery method](https://cloudinary.com/documentation/fetch_remote_images).

## 🧰 Configuration

### Plugin Inputs

| Name            | Required | Description |
|-----------------|----------|-------------|
| cloudName       | false*   | Cloudinary Cloud Name |
| deliveryType    | false    | The method in which Cloudinary stores and delivers images (Ex: fetch, upload) |
| imagePath       | false    | Local path application serves image assets from |
| folder          | false    | Folder all media will be stored in. Defaults to Netlify site name |
| uploadPreset    | false    | Defined set of asset upload defaults in Cloudinary |

*Cloud Name must be set as an environment variable if not as an input

### Setting your Cloud Name

You have two options for setting your Cloud Name: plugin input or environment variable.

**Input**

Inside your Netlify config:

```toml
  [plugins.inputs]
  cloudName = "[Your Cloud Name]"
```

**Environment Variable**

Inside your environment variable configuration:

```
CLOUDINARY_CLOUD_NAME="[Your Cloud Name]"
```

Learn how to [set environment variables with Netlify](https://docs.netlify.com/configure-builds/environment-variables/).

### Changing your Delivery Method

**fetch**

Default - no additional configuration needed.

Learn more about using delivering remote images with [fetch](https://cloudinary.com/documentation/fetch_remote_images).

**upload - Unsigned**

Unsigned uploads require an additional [Upload Preset](https://cloudinary.com/documentation/upload_presets) set up and configured in your Cloudinary account.

Inside your Netlify config:

```toml
[[plugins]]
  package = "netlify-plugin-cloudinary"

  [plugins.inputs]
  cloudName = "[Your Cloudinary Cloud Name]"
  deliveryType = "upload"
  uploadPreset = "[Your Cloudinary Upload Preset]"
```

Learn more about [unsigned uploads](https://cloudinary.com/documentation/upload_images#unsigned_upload).

**upload - Signed**

Signed uploads require you to set your API Key and API Secret as environment variables.

Inside your Netlify config:

```toml
[[plugins]]
  package = "netlify-plugin-cloudinary"

  [plugins.inputs]
  cloudName = "[Your Cloudinary Cloud Name]"
  deliveryType = "upload"
```

Inside your environment variable configuration:

```
CLOUDINARY_API_KEY="[Your Cloudinary API Key]"
CLOUDINARY_API_SECRET="[Your Cloudinary API Secret]"
```

Learn more about [signed uploads](https://cloudinary.com/documentation/upload_images#uploading_assets_to_the_cloud).

### Customizing where your images are served from

By default, the plugin will attempt to serve any thing served from /images as Cloudinary paths. This can be customized by passing in the `imagesPath` input.

Inside your Netlify config:

```toml
[[plugins]]
  package = "netlify-plugin-cloudinary"

  [plugins.inputs]
  cloudName = "[Your Cloudinary Cloud Name]"
  imagesPath = "/my-path"
```

## ⚙️ How It Works

### Delivery Part 1: Replacing all static, on-page images with Cloudinary URLs

During the Netlify build process, the plugin is able to tap into the `onPostBuild` hook where we use [jsdom](https://github.com/jsdom/jsdom) to create a node-based representation of the DOM for each output HTML file, then walk through each node, and if it's an image, we replace the source with a Cloudinary URL.

Depending on the configuration, we'll either use the full URL for that image with the [Cloudinary fetch API](https://cloudinary.com/documentation/fetch_remote_images) or alternatively that image will be [uploaded](https://cloudinary.com/documentation/upload_images), where then it will be served by public ID from the Cloudinary account.

While this works great for a lot of cases and in particular the first load of that page, using a framework with clientside routing or features that mutate the DOM may prevent that Cloudinary URL from persisting, making all of that hard work disappear, meaning it will be served from the Netlify CDN or original remote source (which is fine, but that leads us to Part 2).

### Delivery Part 2: Serving all assets from the /images directory from Cloudinary

To provide comprehensive coverage of images being served from Cloudinary, we take advantage of Netlify's dynamic redirects and serverless functions to map any image being served from the /images directory (or the configured `imagesPath`), redirect it to a serverless function, which then gets redirected to a Cloudinary URL.

Through this process, we're still able to afford the same option of using either the fetch or upload API depending on preference, where the latter would be uploaded if it's a new asset within the serverless function.
