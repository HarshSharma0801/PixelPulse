import express from "express";
import multer from "multer";
import NewProcess from "../controllers/NewProcess";

const router = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

router.post("/process", upload.single("file"), NewProcess.SendNewProcess);

router.get("/", NewProcess.getRequest);

export default router;
