const Router = require('express');
const getLegalEntityById = require('./get-legal-entity-id');

const router = Router();

router.use('/:id', getLegalEntityById);

module.exports = router;
