import express from "express";
import multer from "multer";
import NewProcess from "../controllers/NewProcess";

const router = express.Router();

const upload = multer({ dest: "upload/" });

router.post("/process", upload.single("file"), NewProcess.SendNewProcess);

router.get("/", NewProcess.getRequest);

export default router;
