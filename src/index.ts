import express from "express";
import jwt from "jsonwebtoken";
import { ContenModel, UserModel } from "./db.js";
import { JWTSECRET } from "./config.js"; // Add .env
import { userMiddleware } from "./middleware.js";
const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  //Add zod validation, hash possword
  const username = req.body.username;
  const password = req.body.password;

  const response = await UserModel.findOne({
    username,
  });
  try {
    if (response) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    await UserModel.create({
      username,
      password,
    });

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    username,
    password,
  });

  if (!existingUser) {
    return res.status(403).json({
      message: "Incorrect Credentials!",
    });
  }

  const token = jwt.sign(
    {
      id: existingUser._id,
    },
    JWTSECRET
  );

  res.json({
    token,
  });
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  //tags

  await ContenModel.create({
    link,
    type,
    //@ts-ignore
    userId: req.userId,
    tags: []

  });

  return res.json({
    messsage: "Content added!"
  })
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;

  const content = await ContenModel.find({
    userId: userId
  }).populate("userId", "username")

  res.json({
    content
  })
});

app.get("/api/v1/content", async (req , res))




app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(3000);
