<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/62209650/196528621-b68e9e10-7e55-4c7d-9177-904cadbb4296.png" align="center" height=50>
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/62209650/196528761-a815025a-271a-4d8e-ac7e-cea833728bf9.png" align="center" height=50>
  <img alt="Cloudinary" src="https://user-images.githubusercontent.com/62209650/196528761-a815025a-271a-4d8e-ac7e-cea833728bf9.png" align="center" height=50>
</picture>
&ensp;&ensp;
<picture style="padding: 50px">
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/62209650/196580077-8decb083-1556-4e10-99af-84b79e909229.png" align="center" height=50>
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/62209650/196579993-14e2a5e4-da8d-46a9-87ba-3a76d54975fb.png" align="center" height=50>
  <img alt="Netlify" src="https://user-images.githubusercontent.com/62209650/196579993-14e2a5e4-da8d-46a9-87ba-3a76d54975fb.png" align="center" height=50>
</picture>

######

<a href="https://github.com/colbyfayock/netlify-plugin-cloudinary/actions/workflows/test_and_release.yml"><img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/colbyfayock/netlify-plugin-cloudinary/test_release.yml?branch=main&label=Test%20%26%20Release&style=flat-square"></a> <a href="https://www.npmjs.com/package/netlify-plugin-cloudinary"><img alt="npm" src="https://img.shields.io/npm/v/netlify-plugin-cloudinary?style=flat-square"></a> <a href="https://github.com/colbyfayock/netlify-plugin-cloudinary/blob/main/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/colbyfayock/netlify-plugin-cloudinary?label=License&style=flat-square"></a>

# Cloudinary Netlify Plugin

Optimize and serve all images served in your Netlify site deploy with [Cloudinary](https://cloudinary.com/).

The Cloudinary plugin hooks into your Netlify build process and sets up images for optimization and delivery. First, the plugin replaces all your on-page, post-compilation images with a Cloudinary-sourced URL, greatly accelerating your initial page load. Next, for comprehensive coverage, Cloudinary redirects assets requested from your images directory to a Cloudinary URL with the default fetch feature or the upload delivery type.

tl;dr automatically serves smaller images in modern formats

**This plugin is not officially supported by Cloudinary.**

- [Getting Started](#%EF%B8%8F-getting-started)
- [Configuration](#-configuration)
- [Common Questions & Issues](#%EF%B8%8F%EF%B8%8F-common-questions--issues)
- [How It Works](#%EF%B8%8F-how-it-works)
- [Development](#-development)

## ⚡️ Getting Started

Before installing, make sure you're set up with a free [Cloudinary](https://cloudinary.com/) account.

### Installing via Netlify UI

- [Install the plugin](https://app.netlify.com/plugins/netlify-plugin-cloudinary/install) using the [Netlify Build Plugins Directory](https://app.netlify.com/plugins)

<https://app.netlify.com/plugins/netlify-plugin-cloudinary/install>

- Add your Cloudinary Cloud Name as a [build environment variable](https://docs.netlify.com/configure-builds/environment-variables)

```
Name: CLOUDINARY_CLOUD_NAME
Value: <Your Cloud Name>
```

- Trigger a new deployment!

By default, your images will be served via the [fetch delivery type](https://cloudinary.com/documentation/fetch_remote_images).

### File-based configuration

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

By default, your images will be served via the [fetch delivery type](https://cloudinary.com/documentation/fetch_remote_images).

### Installing locally

- Install the plugin:

```shell
npm install netlify-plugin-cloudinary
```

- Use a [file-based configuration](#file-based-configuration) to add the plugin to your builds

## 🛠 Configuration

### Plugin Inputs

| Name            | Type    |Required | Example   | Description |
|-----------------|---------|---------|-----------| ------------|
| cloudName       | string  | No*     | mycloud   | Cloudinary Cloud Name |
| cname           | string  | No      | domain.com | The custom domain name (CNAME) to use for building URLs (Advanced Plan Users) |
| deliveryType    | string  | No      | fetch     | The method by which Cloudinary stores and delivers images (Ex: fetch, upload) |
| folder          | string  | No      | myfolder  | Folder all media will be stored in. Defaults to Netlify site name |
| imagesPath      | string/Array | No | /assets   | Local path application serves image assets from |
| loadingStrategy | string  | No      | eager     | The method in which in which images are loaded (Ex: lazy, eager) |
| maxSize         | object  | No      | eager     | See Below. |
| privateCdn      | boolean | No      | true      | Enables Private CDN Distribution (Advanced Plan Users) |
| uploadPreset    | string  | No      | my-preset | Defined set of asset upload defaults in Cloudinary |

*Cloud Name must be set as an environment variable if not as an input

#### Max Size

The Max Size option gives you the ability to configure a maximum width and height that images will scale down to, helping to avoid serving unnecessarily large images.

By default, the aspect ratio of the images are preserved, so by specifying both a maximum width and height, you're telling Cloudinary to scale the image down so that neither the width or height are beyond that value.

Additionally, the plugin uses a crop method of `limit` which avoids upscaling images if the images are already smaller than the given size, which reduces unnecessary upscaling as the browser will typically automatically handle.

The options available are:

| Name            | Type    | Example   | Description |
|-----------------|---------|-----------| ------------|
| dpr             | string  | 2.0       | Device Pixel Ratio which essentially multiplies the width and height for pixel density. |
| height          | number  | 600       | Maximum height an image can be delivered as. |
| width           | number  | 800       | Maximum width an image can be delivered as.  |

It's important to note that this will not change the width or height attribute of the image within the DOM, this will only be the image that is being delivered by Cloudinary.

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

> Note: if you are currently restricting Fetched URLs, you need to ensure your Netlify URL is listed under allowed fetch domains. Older accounts may restrict fetched images by default. Read more about [restricting the allowed fetch domains](https://cloudinary.com/documentation/fetch_remote_images#restricting_the_allowed_fetch_domains).

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
  # or imagesPath = [ "/my-path", "/my-other-path" ]
```

## 🕵️‍♀️ Common Questions & Issues

### I'm using the default settings but my images 404

The plugin uses the fetch method by default and if you're receiving a 404 with a valid URL and valid Cloudinary account, you may be currently restricting fetched URLs.

You have two options to resolve this: adding your Netlify domain to the list of "allowed fetch domains" and removing the fetched URL restriction.

Adding your domain to the "allowed fetch domains" list is more secure by not allowing others to use your Cloudinary account with their own images. You can do this under Settings > Security > Allowed fetch domains.

Alternatively, you can remove the restriction and allow all fetched images to work by going to Settings > Security > Restricted media types and unchecking the box for Fetched URL.

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

The repository additionally includes a demo that uses the plugin. The demo is a simple Next.js application that lows a few images statically and those same images in a separate list once the page loads. This helps us test both the on-page image replacement and the redirecting of the images directory.

You can link this project to your Netlify account for testing purposes by creating a new Netlify site at the root of this project and linking it to that new site.

Once linked, you can then run the build and deploy process with:

```
netlify deploy --build
```

### Tests

Tests require all environment variables to be actively set pass. See [configuration](#-configuration) above to see which variables need to be set.

Once set, tests can be run with:

```
npm run test
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://colbyfayock.com/newsletter"><img src="https://avatars.githubusercontent.com/u/1045274?v=4?s=100" width="100px;" alt="Colby Fayock"/><br /><sub><b>Colby Fayock</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=colbyfayock" title="Code">💻</a> <a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=colbyfayock" title="Documentation">📖</a> <a href="#example-colbyfayock" title="Examples">💡</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Chuloo"><img src="https://avatars.githubusercontent.com/u/22301208?v=4?s=100" width="100px;" alt="William"/><br /><sub><b>William</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=Chuloo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://mk.gg"><img src="https://avatars.githubusercontent.com/u/213306?v=4?s=100" width="100px;" alt="Matt Kane"/><br /><sub><b>Matt Kane</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/pulls?q=is%3Apr+reviewed-by%3Aascorbic" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://donno2048.github.io/Portfolio/"><img src="https://avatars.githubusercontent.com/u/61805754?v=4?s=100" width="100px;" alt="Elisha Hollander"/><br /><sub><b>Elisha Hollander</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=donno2048" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Kunal-8789"><img src="https://avatars.githubusercontent.com/u/76679262?v=4?s=100" width="100px;" alt="Kunal Kaushik"/><br /><sub><b>Kunal Kaushik</b></sub></a><br /><a href="#tool-Kunal-8789" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://portfolio-shikhar13012001.vercel.app/"><img src="https://avatars.githubusercontent.com/u/75368010?v=4?s=100" width="100px;" alt="Shikhar"/><br /><sub><b>Shikhar</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=shikhar13012001" title="Code">💻</a> <a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=shikhar13012001" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://digantakrbanik.codes/"><img src="https://avatars.githubusercontent.com/u/65999534?v=4?s=100" width="100px;" alt="Diganta Kr Banik"/><br /><sub><b>Diganta Kr Banik</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=developer-diganta" title="Code">💻</a> <a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=developer-diganta" title="Documentation">📖</a> <a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=developer-diganta" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/3t8"><img src="https://avatars.githubusercontent.com/u/62209650?v=4?s=100" width="100px;" alt="3t8"/><br /><sub><b>3t8</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=3t8" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Abubakrce19"><img src="https://avatars.githubusercontent.com/u/104122959?v=4?s=100" width="100px;" alt="Abubakrce19"/><br /><sub><b>Abubakrce19</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=Abubakrce19" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://ericapisani.dev"><img src="https://avatars.githubusercontent.com/u/5655473?v=4?s=100" width="100px;" alt="Erica Pisani"/><br /><sub><b>Erica Pisani</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=ericapisani" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://matiashernandez.dev"><img src="https://avatars.githubusercontent.com/u/282006?v=4?s=100" width="100px;" alt="Matías Hernández Arellano"/><br /><sub><b>Matías Hernández Arellano</b></sub></a><br /><a href="https://github.com/cloudinary-community/netlify-plugin-cloudinary/commits?author=matiasfha" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->