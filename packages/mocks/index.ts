const legalEntity = require('./legalEntity.ts');
const transferInstrument = require('./transferInstrument.ts');

module.exports = {
    ...legalEntity,
    ...transferInstrument,
};
