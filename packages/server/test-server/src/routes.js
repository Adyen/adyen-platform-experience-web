import { Router } from 'express';
import Transactions from './transactions/routes';
import BalanceAccounts from './balance-accounts/routes';
import AccountHolders from './account-holders/routes';
import LegalEntity from './legal-entity/routes';

const router = Router();

router.use('/transactions', Transactions);
router.use('/balanceAccounts', BalanceAccounts);
router.use('/accountHolders', AccountHolders);
router.use('/accountHolders', LegalEntity);

router.use((req, res) => {
    console.log(`${req.path} didn't match any available endpoint`);
    res.sendStatus(404);
});

export default router;
