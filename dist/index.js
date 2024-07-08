"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
if (process.env.Mongo_ConnectionString) {
    mongoose_1.default.connect(process.env.Mongo_ConnectionString);
}
const db = mongoose_1.default.connection;
db.on("error", function () {
    console.log("Error Connecting");
});
db.on("open", function () {
    console.log("Successfull Connected to Database ");
});
app.use(routes_1.default);
app.listen(process.env.PORT, () => {
    console.log("server is live at " + process.env.PORT);
});
//# sourceMappingURL=index.js.map