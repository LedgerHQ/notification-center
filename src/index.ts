import express from 'express';
import { Users } from './database/model';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config()

// Connect to a MongoDB instance
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_URL!, () => {
  console.log('Connected to database successfully')
});

export const app = express();
const port = 3000;

app.post("/add_user", async (request, response) => {
  const user = new Users(request.body);

  try {
    await user.save();
    response.send(user);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/users", async (request, response) => {
  const users = await Users.find({});

  try {
      response.send(users);
  } catch (error) {
      response.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});