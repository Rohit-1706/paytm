import type { Request, Response } from 'express';
import express from 'express';
import { Account } from '../db';
import authMiddleware from '../middleware';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
    userId?: string;
}

const router = express.Router();    

router.get('/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
    const account = await Account.findOne({
        userId: req.userId
    });
    res.json({
        balance: account?.balance || 0
    });
});

router.post('/transfer', authMiddleware, async (req: AuthRequest, res: Response) => {
    // We are using session and transaction to ensure that both the debit and credit operations are atomic and consistent
    // If any of the operations fail, the transaction will be rolled back and the database will remain in a consistent state

    try {
            const session = await mongoose.startSession();

    session.startTransaction();
    const {amount, toUsername} = req.body;

    // Fetch the account within the Transaction
    const account = await Account.findOne({userId: req.userId}).session(session)

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient Balance"
        });
    }

    const toAccount = await Account.findOne({userId: toUsername}).session(session);

    // To check if sender account exists or not
    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid Account"
        });
    }

    //Perform the transfer
    await Account.updateOne({userId: req.userId}, {$inc: {balance: -amount}}).session(session)
    await Account.updateOne({userId: req.userId}, {$inc: {balance: amount}}).session(session)


    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({
        message: "Transfer Successful"
    });

    } catch (error) {
        console.error("Error during transfer:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }

});

export default router;