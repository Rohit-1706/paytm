import type { Request, Response } from 'express';
import express from 'express';
import { User } from '../db';
import bcrypt from 'bcrypt';
import JWT_SECRET from '../config';
import z from 'zod';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware';


const router = express.Router();

const signupSchema = z.object({
    username: z.email(),
    password: z.string().min(6),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50)
})

router.post('/signup', async (req: Request, res: Response) => {
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


// Signin user
router.post('/signin', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await User.findOne({
        username: username
    });
    if (!user?._id) {
        return res.status(400).json({
            message: "Invalid username or password"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid){
        return res.status(400).json({
            message: "Invalid username or password"
        })
    }
    const token = jwt.sign({
        userId: user._id,
    }, JWT_SECRET, {
        expiresIn: "1h"
    });
    res.status(200).json({
        message: "User signed in successfully",
        token: token
    })
})


// Update user details

const updateUserSchema = z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    password: z.string().min(6).optional()
})

router.put('/', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { firstName, lastName, password } = req.body;

    const { success } = updateUserSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Invalid input data"
        });
    }

    await User.updateOne(req.body, {
        where: {
            _id: userId
        }
    });

    res.json({
        message: "User details updated successfully"
    });
})

// filter Users (return all the users whose first name or last name matches the query parameter "name")
router.get('/bulk', authMiddleware, async (req: Request, res: Response) => {
    const filter = req.query.filter as string || "";

    const users = await User.find({
        $or: [
            {
                firstName: {
                    $regex: filter,
                    $options: "i"
                }
            },
            {
                lastName: {
                    $regex: filter,
                    $options: "i"
                }
            }
        ]
    });

    res.json({
        users: users.map(user => ({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username
        }))
    })
}) 

export default router;