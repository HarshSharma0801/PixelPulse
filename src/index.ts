import express from "express";
import router from "./routes";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

if (process.env.Mongo_ConnectionString) {
  mongoose.connect(process.env.Mongo_ConnectionString);
}

const db = mongoose.connection;
db.on("error", function () {
  console.log("Error Connecting");
});

db.on("open", function () {
  console.log("Successfull Connected to Database ");
});

app.use(router);

app.listen(process.env.PORT, () => {
  console.log("server is live at " + process.env.PORT);
});
