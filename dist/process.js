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
const client_s3_1 = require("@aws-sdk/client-s3");
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
const bucketRegion = process.env.S3_BUCKET_REGION;
let S3;
if (bucketRegion && secretKey && accessKey) {
    S3 = new client_s3_1.S3Client({
        region: bucketRegion,
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
    });
}
else {
    console.error("AWS S3 credentials or region not provided.");
}
const ProcessImage = (url, imageName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!S3) {
            throw new Error("AWS S3 client is not initialized.");
        }
        const response = yield axios_1.default.get(url, {
            responseType: "arraybuffer",
            maxRedirects: 5,
        });
        const imageBuffer = yield (0, sharp_1.default)(response.data)
            .jpeg({ quality: 50 })
            .toBuffer();
        const s3Params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: imageName,
            Body: imageBuffer,
            ContentType: "image/jpeg",
        };
        const command = new client_s3_1.PutObjectCommand(s3Params);
        yield S3.send(command);
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${imageName}`;
    }
    catch (error) {
        console.error(`Error processing image ${url}: `, error);
        return null;
    }
});
exports.default = ProcessImage;
//# sourceMappingURL=process.js.map