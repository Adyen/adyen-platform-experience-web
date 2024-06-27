require('dotenv').config({ path: `${__dirname}/.env` });
const express = require('express');
const { getUserAccountHolderId, getUserRoles, httpPost } = require('./utils');

const { API_KEY } = process.env;
const myOrigin = 'http://localhost:3031';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/getMySession', (_, res) => {
    const apiKey = API_KEY;
    const url = 'https://test.adyen.com/authe/api/v1/sessions';

    const request = {
        allowOrigin: myOrigin,
        reference: 'YOUR_INTERNAL_IDENTIFIER',
        product: 'platform',
        policy: {
            resources: [
                {
                    accountHolderId: getUserAccountHolderId(),
                    type: 'accountHolder',
                },
            ],
            roles: getUserRoles(),
        },
    };

    httpPost({ apiKey, url, request, res });
});

const port = process.env.PORT || 3040;
app.listen(port, () => console.log(`Listening on localhost:${port}`));
