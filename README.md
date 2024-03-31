# Adyen FP

[![npm](https://img.shields.io/npm/v/@adyen/adyen-pe-web.svg)](http://npm.im/pablo/adyen-fp)

Adyen FP provides you with the building blocks to create an internal dashboard for your platform customers.

## Prerequisites

-   [Adyen test account](https://www.adyen.com/signup)
-   [API key](https://docs.adyen.com/development-resources/how-to-get-the-api-key)
-   [Client key](https://docs.adyen.com/development-resources/client-side-authentication#get-your-client-key)

## Installation

We only provide full support when you use one of these methods of installation.

### Node package manager

1. Install the [Adyen FP Node package](https://www.npmjs.com/package/@adyen/adyen-fp):

```sh
npm install @adyen/adyen-pe-web --save
```

2. Import Adyen FP into your application:

```js
import AdyenPlatformExperience from '@adyen/adyen-pe-web';
import '@adyen/adyen-pe-web/dist/adyen-pe-web.css';
```

## Development

To run the development environment:

1. Clone [this repository](https://github.com/Adyen/adyen-pe-web).
2. Create a `.env` file on your project's root folder following the example in [`env.default`](envs/env.default) and fill in the environment variables.
3. Install the dependencies by running:

```sh
npm install
```

4. Run the development environment, which starts a server listening on [http://localhost:3020](http://localhost:3030):

```sh
npm start
```

## Contributing

We merge every pull request into the `main` branch. We aim to keep `main` in good shape, which allows us to release a new version whenever we need to.

Have a look at our [contributing guidelines](https://github.com/Adyen/.github/blob/main/CONTRIBUTING.md) to find out how to raise a pull request.

## See also

-   [Documentation](https://docs.adyen.com/)
-   [API Explorer](https://docs.adyen.com/api-explorer/)

## Support

If you have a feature request, or spotted a bug or a technical problem, [create an issue here](https://github.com/Adyen/adyen-pe-web/issues/new/choose).

For other questions, [contact our support team](https://support.adyen.com/hc/en-us/requests/new?ticket_form_id=360000705420).

## License

This repository is available under the [MIT license](LICENSE).
