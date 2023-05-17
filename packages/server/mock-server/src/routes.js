import Router from 'express';
import LegalEntity from './legal-entity/routes';
import AccountHolder from './account-holder/routes';
import Transactions from './transactions/routes';
import BalanceAccount from './balance-account/routes';

const router = Router();

router.use('/legalEntities', LegalEntity);
router.use('/accountHolders', AccountHolder);
router.use('/balanceAccounts', BalanceAccount);
router.use('/transactions', Transactions);
router.use((req, res) => {
    console.log(`${req.path} didn't match any mocks`);
    res.sendStatus(404);
});

export default router;
