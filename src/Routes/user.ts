import express, {Request, Response} from "express"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
const zod = require("zod")
const {JWT_SECRET} = require("../config")
const {authMiddleware} = require("../middleware/authMiddleware")
const jwt = require("jsonwebtoken")
import { CustomRequest } from "../middleware/authMiddleware"



const prisma = new PrismaClient()


const router = express.Router()
const saltRound = 10

router.get("/", (req: Request, res: Response)=>{
    res.json({
        message: "from the users get route"
    })
})

//sign up user

const signupZodSchema = zod.object({
    email: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string().nullable(),
    password: zod.string(),
  });

  router.post("/signup", async (req: Request, res: Response) => {
    const body = req.body;
  
    const { success } = signupZodSchema.safeParse(body);
  
    if (!success) {
      return res.status(400).json({
        message: "Wrong inputs",
      });
    }

    const userExist = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
  
    if (userExist) {
        console.log(1)
      return res.status(400).json({
        message: "Email already taken",
      });
    }
  
    try {
        const hashedPassword = await bcrypt.hash(body.password, saltRound)
      await prisma.user.create({
        data: {
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          password: hashedPassword,
        },
      });

      res.json({
        message: "User created successfully",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  });
  
//signin user

const signinZodSchema = zod.object({
    email: zod.string().email(),
    password : zod.string()
})


router.post("/signin", async(req: Request, res: Response)=>{

    const body = req.body;

    const {success} = signinZodSchema.safeParse(body);

    if(!success){
        res.status(400).json({
            message: "wrong input"
        })
    }

    try {

        const user = await prisma.user.findUnique({
            where:{
                email: body.email,
                isDeleted: false
            }
        })

        if(!user || !(await bcrypt.compare(body.password, user.password))){
            return res.status(400).json({
                message : "invalid email and password"
            })
        }

        const token = jwt.sign(
            {
              userId : user.id,
            },
            JWT_SECRET
          );
        
          res.json({
            message: "User signed in successfully",
            token: token,
          });
         
    } catch (error) {
        console.error("Error logining user:", error);
      res.status(500).json({
        message: "Internal server error",  
    })}

})

//update user 

router.put("/update", authMiddleware, async(req: Request, res: Response)=>{
    const {firstName, lastName} = req.body
    await prisma.user.update({
        where:{
            id: (req as CustomRequest).userId as number
        },
        data:{
            firstName: firstName,
            lastName: lastName
        }
    })
    res.status(200).json({
        message: "name and last name is updated"
    })
})


//delete user
router.delete("/delete", authMiddleware, async(req:Request, res: Response)=>{
    
    await prisma.user.update({
        where:{
            id : (req as CustomRequest).userId as number
        },
        data:{
            isDeleted: true
        }
    })

    res.status(400).json({
        message: "user deleted successfully"
    })

})

module.exports = router