const { JWT_SECRET }  = require('../config');
import { Request, Response, NextFunction } from "express"
const  jwt = require("jsonwebtoken")


export interface CustomRequest extends Request{
    userId: Number
}

const authMiddleware = (req: Request, res: Response, next: NextFunction)=>{

    const tokenHeader: string| undefined = req.headers.authorization;

    if(!tokenHeader){
        return res.status(400).json({
            message: "token required"
        })
    }

    try {
        const decode:any = jwt.verify(tokenHeader, JWT_SECRET) 
    
        if(decode.userId){
            (req as CustomRequest).userId = decode.userId;
            next()
        }else{
            return res.status(400).json({
                message: "internal error"
            })
        }
    } catch (error) {
        return res.status(403).json({
            message: 'invalid token',
        });
        
    }

}

module.exports = {
    authMiddleware
}