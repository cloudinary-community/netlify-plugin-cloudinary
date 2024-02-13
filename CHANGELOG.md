# [1.16.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.15.0...v1.16.0) (2023-12-04)


### Features

* Consolidate onBuild tests + verify imagesPath for multiple operating systems ([#101](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/101)) ([90b20bd](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/90b20bde822c8190fe760f86dd9fee8591a2e611)), closes [#100](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/100) [#100](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/100)

# [1.15.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.14.0...v1.15.0) (2023-11-13)


### Features

* Get loadingStrategy value from netlify.toml inputs, default to 'lazy' if not provided ([#98](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/98)) ([8d68b05](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/8d68b05b35edaf641860822a6dad13989a582854))

# [1.14.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.13.1...v1.14.0) (2023-11-10)


### Features

* Retry failed requests ([bda0cd9](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/bda0cd94da2bc870a943562d43cc47fc17a3ad15)), closes [#82](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/82)

## [1.13.1](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.13.0...v1.13.1) (2023-11-10)


### Bug Fixes

* Fixes uncaught errors in concurrency loop ([#95](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/95)) ([2c6a33b](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/2c6a33b45da29a4b6a01e3b1630905989df69177)), closes [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#94](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/94)

# [1.13.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.12.0...v1.13.0) (2023-11-07)


### Features

* Concurrency ([#89](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/89)) ([6a8d70f](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/6a8d70f923384f4a2ddae66967b8010cff551b01)), closes [#57](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/57)

# [1.12.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.11.0...v1.12.0) (2023-10-04)


### Features

* throw and catch error when calls to cloudinary upload fails ([#72](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/72)) ([c90c46f](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/c90c46ffc9a7ed4bb3c00fa87606f2130cef1596)), closes [#58](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/58)

# [1.11.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.10.2...v1.11.0) (2023-09-20)


### Features

* Max Size ([#78](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/78)) ([57cb8fb](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/57cb8fba2d82ecc234f950dab459574d23dfafae)), closes [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#62](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/62)

## [1.10.2](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.10.1...v1.10.2) (2023-09-19)


### Bug Fixes

* Fixes Netlify URL ([#84](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/84)) ([3a83908](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/3a83908fc921bfec4b2125ed2abd75c243c8d479)), closes [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#83](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/83)

## [1.10.1](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.10.0...v1.10.1) (2023-09-19)


### Bug Fixes

* Fixes missing API Key and Secret failing Fetch builds ([#81](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/81)) ([cdd5981](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/cdd598177824c5a3f753cb045a7fe4d6a29d9207)), closes [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#80](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/80)

# [1.10.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.9.0...v1.10.0) (2023-09-15)


### Features

* Configure Multiple Image Paths ([#75](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/75)) ([e10cffa](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/e10cffa3ff269275a2a6ef3ad39cbd5756711ebc)), closes [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#61](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/61)

# [1.9.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.8.0...v1.9.0) (2023-09-15)


### Features

* CNAME & Private CDN ([#71](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/71)) ([17fff6b](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/17fff6b87cf69d1e2d37c1c7ddd211afd8aeba33)), closes [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#51](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/51)

# [1.8.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.7.1...v1.8.0) (2023-09-06)


### Bug Fixes

* cleaning readme, forcing deploy ([d9558d4](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/d9558d4c6d633490517bde2f798f3977e82d16d8))
* release ([1ce13df](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/1ce13df6402c73308257918013a72a942cd84753))
* workspace root for release ([589d257](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/589d2575fea20425a942a9ea30a78d06d2a5a2e8))


### Features

* pnpm Workspace ([#64](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/64)) ([02f92ac](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/02f92acf001149c9cf229bfb93e455ebd9a68b72))

## [1.7.1](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.7.0...v1.7.1) (2023-09-06)


### Bug Fixes

* removing postinstall to avoid breaking package installations ([a5a71cb](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/a5a71cbf99b9f0e085a91ec4d63877c27d2d4dd6))

# [1.7.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.6.0...v1.7.0) (2023-09-06)


### Features

* migrate to typescript ([#63](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/63)) ([f9b960f](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/f9b960f45cce8d54b0369a53af4613cb65025d03))

# [1.6.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.5.1...v1.6.0) (2023-08-31)


### Features

* Replace preload tags for related image source if exists ([#55](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/55)) ([aaa030f](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/aaa030f2ee71225b1a4b833e9a573ff42d940461)), closes [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#54](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/54)

## [1.5.1](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.5.0...v1.5.1) (2023-08-29)


### Bug Fixes

* Fixes missing Netlify Host check ([#50](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/50)) ([646e1f3](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/646e1f3355530fc5a6b1458a5ef24e409f83c1be)), closes [#47](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/47) [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#45](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/45)

# [1.5.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.4.0...v1.5.0) (2023-08-29)


### Features

* updating package-lock ([2a89820](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/2a89820a35a6a2e72395640085c4bf83da11256c))
* Use Netlify Host with Production Context ([#47](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/47)) ([896bcda](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/896bcda6f8ceeca2d33bb9463d6a0078db729a6c)), closes [#11](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/11) [#45](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/45)

# [1.4.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.3.0...v1.4.0) (2023-08-29)


### Features

* Yarn to npm ([#49](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/49)) ([c7d5126](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/c7d5126e2adbb7924b99e95d5fa8a83e83e1c6b5))

# [1.3.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.2.0...v1.3.0) (2023-08-29)


### Features

* Package updates, Remove fs-extra, Fix Jest ([#48](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/48)) ([65f8600](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/65f8600e65cbb8dd19feaa597cb8ba32a5d6e57e))

# [1.2.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.1.0...v1.2.0) (2022-10-14)


### Bug Fixes

* Fixes asset not defined error when using upload delivery type ([#36](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/36)) ([86edaab](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/86edaab087eb9d185231e83c67cffa72db2db3d1))


### Features

* added lazy loading to images ([#33](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/33)) ([af01791](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/af01791786ce8db42435e50e2b1f223e4db4a924))

# [1.1.0](https://github.com/colbyfayock/netlify-plugin-cloudinary/compare/v1.0.3...v1.1.0) (2022-10-13)


### Features

* Add srcset support ([#30](https://github.com/colbyfayock/netlify-plugin-cloudinary/issues/30)) ([e51e298](https://github.com/colbyfayock/netlify-plugin-cloudinary/commit/e51e2981d274f7281d3de848668be65e6777a56e))
