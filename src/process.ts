import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import axios from "axios";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config();

const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
const bucketRegion = process.env.S3_BUCKET_REGION;

let S3: S3Client | undefined;

if (bucketRegion && secretKey && accessKey) {
  S3 = new S3Client({
    region: bucketRegion,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
} else {
  console.error("AWS S3 credentials or region not provided.");
}

const ProcessImage = async (url: string, imageName: string) => {
  try {
    if (!S3) {
      throw new Error("AWS S3 client is not initialized.");
    }

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      maxRedirects: 5,
    });

    const imageBuffer = await sharp(response.data)
      .jpeg({ quality: 50 })
      .toBuffer();

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: imageName,
      Body: imageBuffer,
      ContentType: "image/jpeg",
    };

    const command = new PutObjectCommand(s3Params);
    await S3.send(command);
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${imageName}`;
  } catch (error) {
    console.error(`Error processing image ${url}: `, error);
    return null;
  }
};

export default ProcessImage;
