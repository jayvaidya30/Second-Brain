import express from "express";
import jwt from "jsonwebtoken";
import { ContenModel, LinkModel, UserModel } from "./db.js";
import { JWTSECRET } from "./config.js"; // Add .env
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());

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
  const title = req.body.title;
  //tags

  await ContenModel.create({
    link,
    type,
    title,
    //@ts-ignore
    userId: req.userId,
    tags: [],
  });

  return res.json({
    messsage: "Content added!",
  });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;

  const content = await ContenModel.find({
    userId: userId,
  }).populate("userId", "username");

  res.json({
    content,
  });
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share;
  if (share) {
    const existinLink = await LinkModel.findOne({
      //@ts-ignore
      userId: req.userId,
    });

    if(existinLink){
      res.json({
        hash: existinLink.hash
      })
      return;
    }


    const hash = random(10);
    await LinkModel.create({
      //@ts-ignore
      userId: req.userId,
      hash: hash,
    });

    res.json({
      message: "/share/" + hash,
    });
  } else {
    await LinkModel.deleteOne({
      //@ts-ignore
      userId: req.userId,
    });
  }

  res.json({
    message: "Remove link",
  });
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input",
    });
    return;
  }

  const content = await ContenModel.find({
    userId: link.userId,
  });

  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res.status(411).json({
      message: "user not found, ideally should not happen",
    });
    return;
  }

  res.json({
    username: user.username,
    content: content,
  });
});

app.listen(3000);
