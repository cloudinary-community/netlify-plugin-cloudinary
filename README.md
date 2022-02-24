# Cloudinary Netlify Plugin

Optimize and serve all images served in your Netlify site deploy with [Cloudinary](https://cloudinary.com/).

<img height="50" src="https://res.cloudinary.com/cloudinary-marketing/image/upload/f_auto,q_auto,h_100/v1595456749/creative_source/Logo/PNG/cloudinary_logo_blue_0720_2x.png" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img height="50" src="https://res.cloudinary.com/colbycloud/image/upload/f_auto,q_auto,h_100/v1645122900/logos/netlify_ucvb40.png" />

The Cloudinary plugin hooks into your Netlify build process and sets up images to be optimized and delivered by Cloudinary. First, the plugin will replace all of your on-page images post compilation with a Cloudinary-sourced URL giving your initial page load a huge boost by optimizing your media. To provide comprehensive coverage beyond the on-page images, any assets requested directly from your images directory will be redirected to a Cloudinary URL, whether using the Cloudinary fetch (default) or upload delivery type.

tl;dr automatically serve smaller images in modern formats

**This plugin is not officially supported by Cloudinary.**

- [Getting Started](#%EF%B8%8F-getting-started)
- [Configuration](#-configuration)
- [How It Works](#%EF%B8%8F-how-it-works)
- [Development](#-development)

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
  cloudName = "<Your Cloud Name>"
```

By default, your images will served via the [fetch delivery type](https://cloudinary.com/documentation/fetch_remote_images).

## 🛠 Configuration

### Plugin Inputs

| Name            | Required | Example   | Description |
|-----------------|----------|-----------| ------------|
| cloudName       | No*      | mycloud   | Cloudinary Cloud Name |
| deliveryType    | No       | fetch     | The method in which Cloudinary stores and delivers images (Ex: fetch, upload) |
| imagePath       | No       | /assets   | Local path application serves image assets from |
| folder          | No       | myfolder  | Folder all media will be stored in. Defaults to Netlify site name |
| uploadPreset    | No       | my-preset | Defined set of asset upload defaults in Cloudinary |

*Cloud Name must be set as an environment variable if not as an input

### Environment Variables

| Name                   | Required | Example  | Description |
|------------------------|----------|----------|-------------|
| CLOUDINARY_CLOUD_NAME  | No*      | mycloud  | Cloudinary Cloud Name |
| CLOUDINARY_API_KEY     | No       | 1234     | Cloudinary API Key |
| CLOUDINARY_API_SECRET  | No       | abcd1234 | Cloudinary API Secret |

*Cloud Name must be set as an input variable if not as an environment variable

### Setting your Cloud Name

You have two options for setting your Cloud Name: plugin input or environment variable.

**Input**

Inside your Netlify config:

```toml
  [plugins.inputs]
  cloudName = "<Your Cloud Name>"
```

**Environment Variable**

Inside your environment variable configuration:

```
CLOUDINARY_CLOUD_NAME="<Your Cloud Name>"
```

Learn how to [set environment variables with Netlify](https://docs.netlify.com/configure-builds/environment-variables/).

### Changing your Delivery Type

**fetch**

Default - no additional configuration needed.

The fetch method allows you to use Cloudinary delivery by providing a remote URL. Learn more about using delivering remote images with [fetch](https://cloudinary.com/documentation/fetch_remote_images).

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

Uploading media to Cloudinary gives you more flexibility with your media upon delivery. Learn more about [unsigned uploads](https://cloudinary.com/documentation/upload_images#unsigned_upload).

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

Uploading media to Cloudinary gives you more flexibility with your media upon delivery. Learn more about [signed uploads](https://cloudinary.com/documentation/upload_images#uploading_assets_to_the_cloud).

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

## 🧰 Development

### Plugin

To actively develop with the plugin, you need to be able to run a Netlify build and deploy.

You can do this by pushing a site that uses this plugin to Netlify or you can use the [Netlify CLI](https://docs.netlify.com/cli/get-started/) locally (recommended).

You can reference the plugin locally in your `netlify.toml` by specifying the directory the plugin is in relative to your project, for example:
```
[[plugins]]
  package = "../netlify-plugin-cloudinary"
```

On the locally linked Netlify project, you can then run:

```
netlify deploy --build
```

Which will combine the build and deploy contexts and run through the full process, generating a preview URL.

#### Caveats
* The Netlify CLI doesn't support all input and environment variables for build plugins, primarily `process.env.DEPLOY_PRIME_URL` meaning the `onPostBuild` image replacement will not occur locally.

### Demo

The repository additionally includes a demo which uses the plugin. The demo is a simple Next.js application that lows a few images statically and those same images in a separate list once the page loads. This helps us test both the on-page image replacement and the redirecting of the images directory.

You can link this project to your Netlify account for testing purposes by creating a new Netlify site in the root of this project and linking it to that new site.

Once linked, you can then run the build and deploy process with:

```
netlify deploy --build
```

### Tests

Tests require all environment variables to be actively set in order to pass. See [configuration](#-configuration) above to see which variables need to be set.

Once set, tests can be ran with:

```
yarn test
```
