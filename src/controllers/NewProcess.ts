import express from "express";
import ProcessImage from "../process";
import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import async from "async";
import Request from "../modal/Request";
import uniqid from "uniqid";

class NewProcess {
  SendNewProcess = async (req: express.Request, res: express.Response) => {
    try {
      const filePath = req.file?.path;

      if (!filePath) {
        return res.send("error in file , try agian !");
      }

      const UniqueId = uniqid();
      await Request.create({
        reqId: UniqueId,
        information: [],
        status: "processing",
      });
      const Process = async () => {
        const results: any[] = [];

        const readStream = fs.createReadStream(filePath);
        const parser = csv();

        readStream.pipe(parser);

        let headersValidated = false;
        const expectedHeaders = ["S.No.", "Product Name", "Input Image Urls"];

        parser.on("headers", (headers) => {
          headersValidated = expectedHeaders.every(
            (header, index) => header === headers[index]
          );
          if (!headersValidated) {
            readStream.destroy();
            res
              .status(400)
              .send(
                "Invalid CSV headers. Expected: S.No., Product Name, Input Image Urls"
              );
          }
        });

        parser.on("data", (data) => {
          results.push(data);
        });

        parser.on("end", async () => {
          const processedResults: any[] = [];

          const queue = async.queue(async (row: any, callback) => {
            const images = row["Input Image Urls"]
              .split(",")
              .map((url: string) => url.trim().replace(/^["']|["']$/g, ""));

            const processImagesSequentially = async (
              images: string[],
              sNo: string
            ) => {
              const processedImageUrls: string[] = [];
              for (let index = 0; index < images.length; index++) {
                const url = images[index];
                const NameId = uniqid();
                const imageName = `${NameId}_${index}.jpg`;
                const processedUrl = await ProcessImage(url, imageName);
                if (processedUrl) {
                  processedImageUrls.push(processedUrl);
                }
              }
              return processedImageUrls;
            };
            const processedImageUrls = await processImagesSequentially(
              images,
              row["S.No."]
            );

            if (processedImageUrls) {
              processedResults.push({
                sNo: row["S.No."],
                productName: row["Product Name"],
                inputImages: images,
                outputImages: processedImageUrls,
              });

              callback();
            }
          }, 1);

          results.forEach((row) => queue.push(row));

          queue.drain(async () => {
            await Request.findOneAndUpdate(
              { reqId: UniqueId },
              {
                information: processedResults,
                status: "processed",
              }
            );

            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(err);
              }
            });
          });
        });
      };

      Process();

      res.status(200).json({ valid: true, RequestId: UniqueId });
    } catch (error) {
      console.log(error);
    }
  };

  getRequest = async (req: express.Request, res: express.Response) => {
    const { requestId } = req.query;

    try {
      const existingRequest = await Request.findOne({ reqId: requestId });
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
    } catch (error) {
      console.log(error);
    }
  };
}

export default new NewProcess();
