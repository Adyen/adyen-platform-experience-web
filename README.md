![Platform Experience header](https://github.com/Adyen/adyen-platform-experience-web/assets/7926613/18094965-9e01-450e-8dc9-ea84e6b22c2b)

# Adyen Platform Experience

[![npm](https://img.shields.io/npm/v/@adyen/adyen-platform-experience-web.svg)](http://npm.im/@adyen/adyen-platform-experience-web)

Adyen Platform Experience components provides you with the building blocks to create an interactive dashboard for your platform customers.

## Contributing

We strongly encourage you to contribute to our repository.

Keep in mind we merge every pull request into the `develop` branch. We aim to keep `develop` in good shape, which allows us to release a new version whenever we need to.

Find out more in our [contribution guidelines](https://github.com/Adyen/.github/blob/master/CONTRIBUTING.md).

## Requirements

-   [Adyen test account](https://www.adyen.com/signup)
-   [API key](https://docs.adyen.com/development-resources/how-to-get-the-api-key)

## Installation

We only provide full support when you use one of these methods of installation.

### Node package manager

1. Install the [Adyen Platform Experience Node package](https://www.npmjs.com/package/@adyen/adyen-platform-experience-web):

```sh
npm install @adyen/adyen-platform-experience-web --save
```

2. Import Adyen Platform Experience into your application:

```js
import AdyenPlatformExperience from '@adyen/adyen-platform-experience-web';
```

## Development

To run the development environment:

1. Clone [this repository](https://github.com/Adyen/adyen-platform-experience-web).
2. Create a `.env` file on your project's root folder following the example in [`env.default`](envs/env.default) and fill in the environment variables.
3. Install the dependencies by running:

```sh
npm install
```

4. Run the development environment, which starts a server listening on [http://localhost:3030](http://localhost:3030):

```sh
npm start
```

## See also

-   [Documentation](https://docs.adyen.com/platforms/components-overview/)
-   [API Explorer](https://docs.adyen.com/api-explorer/)

## Support

If you have a feature request, or spotted a bug or a technical problem, [create a GitHub issue here](https://github.com/Adyen/adyen-platform-experience-web/issues/new/choose). For other questions, contact our Support Team via [Customer Area](https://ca-live.adyen.com/ca/ca/contactUs/support.shtml) or via email: support@adyen.com

## License
MIT license. For more information, see the [LICENSE file](LICENSE).
