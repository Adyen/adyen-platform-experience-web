const Router = require('express');
const LegalEntity = require('./legal-entity/routes');

const router = Router();

router.use('/legalEntities', LegalEntity);

router.use((req, res) => {
    console.log(`${req.path} didn't match any mocks`);
    res.sendStatus(404);
});

module.exports = router;
