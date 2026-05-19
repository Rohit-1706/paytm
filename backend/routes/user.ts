import express from 'express';
import { User } from '../db';
import bcrypt from 'bcrypt';
import JWT_SECRET from '../config';
import z, { boolean } from 'zod';
import jwt from 'jsonwebtoken';

const router = express.Router();

const signupSchema = z.object({
    username: z.email(),
    password: z.string().min(6),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50)
})

router.post('/signup', async(req, res) => {
    const { success } = signupSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Invalid input data"
        });
    }

    const user = await User.findOne({
        username: req.body.username
    });

    if (user?._id){
        return res.status(400).json({
            message: "Username already exists"
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const dbUser = await User.create(req.body);

    const token = jwt.sign({
        userId: dbUser._id,
    }, JWT_SECRET, {
        expiresIn: "1h"
    });


    res.json({
        message: "User created successfully",
        token: token
    })

})

export default router;