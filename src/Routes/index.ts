import express, { Request, Response } from 'express'
const userRouter = require("./user")

const router = express.Router()

router.get("/", (req: Request, res: Response)=>{
    res.json({
        message: "up n up running"
    })
})

router.use("/user", userRouter)

export default router;