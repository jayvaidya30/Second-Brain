import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWTSECRET } from "./config.js";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const decodedToken = jwt.verify(header as string, JWTSECRET);
    if(decodedToken){
        // @ts-ignore
        req.userId = decodedToken.id;
        next()
    } else {
        res.status(403).json({
            message: "You're not logged in!"
        })
    }
};
