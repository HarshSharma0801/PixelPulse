"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RequestSchema = new mongoose_1.default.Schema({
    reqId: { type: String },
    information: [],
    status: { type: String }
});
const Request = mongoose_1.default.model('Requet', RequestSchema);
exports.default = Request;
//# sourceMappingURL=Request.js.map