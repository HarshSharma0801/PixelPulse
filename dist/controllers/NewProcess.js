"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("../process"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const async_1 = __importDefault(require("async"));
const Request_1 = __importDefault(require("../modal/Request"));
const uniqid_1 = __importDefault(require("uniqid"));
class NewProcess {
    constructor() {
        this.SendNewProcess = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
                if (!filePath) {
                    return res.send("error in file , try agian !");
                }
                const UniqueId = (0, uniqid_1.default)();
                yield Request_1.default.create({
                    reqId: UniqueId,
                    information: [],
                    status: "processing",
                });
                const Process = () => __awaiter(this, void 0, void 0, function* () {
                    const results = [];
                    const readStream = fs_1.default.createReadStream(filePath);
                    const parser = (0, csv_parser_1.default)();
                    readStream.pipe(parser);
                    let headersValidated = false;
                    const expectedHeaders = ["S.No.", "Product Name", "Input Image Urls"];
                    parser.on("headers", (headers) => {
                        headersValidated = expectedHeaders.every((header, index) => header === headers[index]);
                        if (!headersValidated) {
                            readStream.destroy();
                            res
                                .status(400)
                                .send("Invalid CSV headers. Expected: S.No., Product Name, Input Image Urls");
                        }
                    });
                    parser.on("data", (data) => {
                        results.push(data);
                    });
                    parser.on("end", () => __awaiter(this, void 0, void 0, function* () {
                        const processedResults = [];
                        const queue = async_1.default.queue((row, callback) => __awaiter(this, void 0, void 0, function* () {
                            const images = row["Input Image Urls"]
                                .split(",")
                                .map((url) => url.trim().replace(/^["']|["']$/g, ""));
                            const processImagesSequentially = (images, sNo) => __awaiter(this, void 0, void 0, function* () {
                                const processedImageUrls = [];
                                for (let index = 0; index < images.length; index++) {
                                    const url = images[index];
                                    const imageName = `${sNo}_${index}_${new Date()}.jpg`;
                                    const processedUrl = yield (0, process_1.default)(url, imageName);
                                    if (processedUrl) {
                                        processedImageUrls.push(processedUrl);
                                    }
                                }
                                return processedImageUrls;
                            });
                            const processedImageUrls = yield processImagesSequentially(images, row["S.No."]);
                            if (processedImageUrls) {
                                processedResults.push({
                                    sNo: row["S.No."],
                                    productName: row["Product Name"],
                                    inputImages: images,
                                    outputImages: processedImageUrls,
                                });
                                callback();
                            }
                        }), 1);
                        results.forEach((row) => queue.push(row));
                        queue.drain(() => __awaiter(this, void 0, void 0, function* () {
                            yield Request_1.default.findOneAndUpdate({ reqId: UniqueId }, {
                                information: processedResults,
                                status: "processed",
                            });
                            fs_1.default.unlink(filePath, (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }));
                    }));
                });
                Process();
                res.status(200).json({ valid: true, RequestId: UniqueId });
            }
            catch (error) {
                console.log(error);
            }
        });
        this.getRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { requestId } = req.query;
            try {
                const existingRequest = yield Request_1.default.findOne({ reqId: requestId });
                if (!existingRequest) {
                    return res.send("No Request found for this Id !");
                }
                if (existingRequest.status === "processing") {
                    return res.send("Request is still processing data !");
                }
                return res.status(200).json({
                    msg: "Data has been successfully processed",
                    output: existingRequest,
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.default = new NewProcess();
//# sourceMappingURL=NewProcess.js.map