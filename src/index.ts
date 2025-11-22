import express from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "./db.js";
const app = express();
const JWTSECRET = "TestSecret"; // Add .env
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  //Add zod validation, hash possword
  const username = req.body.username;
  const password = req.body.password;

  const response = await UserModel.findOne({
    username,
  });

  if (response) {
    res.status(403).json({
      message: "User already exists",
    });
  } else {
    await UserModel.create({
      username: username,
      password: password,
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.usernmae;
  const password = req.body.password;

  const response = await UserModel.find({
    username,
  });

  if (response) {
    res.json({
      message: "Please signup!",
    });
  } else {
    //     jwt.sign({ id: _id }, JWTSECRET);
    //     res.json({});
  }
});

app.get("/api/v1/content", (req, res) => {});

app.delete("/api/v1/content", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});
