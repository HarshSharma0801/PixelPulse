"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const NewProcess_1 = __importDefault(require("../controllers/NewProcess"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "upload/" });
router.post("/process", upload.single("file"), NewProcess_1.default.SendNewProcess);
router.get("/", NewProcess_1.default.getRequest);
exports.default = router;
//# sourceMappingURL=index.js.map