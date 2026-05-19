import express from 'express';
import userRouter from './user';

const router = express.Router();

router.use('/user', userRouter);

export default router;
// api/v1/user
// api/v1/transactions
// api/v1/accounts
// in production, we routee all api calls to /api/v1/* and then we can have multiple routers for different resources like user, transactions, accounts etc.
