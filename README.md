# Cloudinary Netlify Plugin

Optimize and serve all images served in your Netlify site deploy with [Cloudinary](https://cloudinary.com/).

**This plugin is not officially supported by Cloudinary.**

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
  deliveryMethod = "upload"
  uploadPreset = "[Your Cloudinary Upload Preset]"
```

Learn more about [unsigned uploads](https://cloudinary.com/documentation/upload_images#unsigned_upload).

**upload - Signed

Signed uploads require you to set your API Key and API Secret as environment variables.

Inside your Netlify config:

```toml
[[plugins]]
  package = "netlify-plugin-cloudinary"

  [plugins.inputs]
  cloudName = "[Your Cloudinary Cloud Name]"
  deliveryMethod = "upload"
```

Inside your environment variable configuration:

```
CLOUDINARY_API_KEY="[Your Cloudinary API Key]"
CLOUDINARY_API_SECRET="[Your Cloudinary API Secret]"
```

Learn more about [signed uploads](https://cloudinary.com/documentation/upload_images#uploading_assets_to_the_cloud).