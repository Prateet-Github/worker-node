import { GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { s3 } from "../config/s3";

export const downloadFromS3 = async (key: string, outputPath: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_RAW_BUCKET!,
    Key: key,
  });

  try {
    console.log(`Downloading: ${key}`);

    const response = await s3.send(command);

    if (!response.Body) {
      throw new Error("Empty S3 response body");
    }

    // ensuring the directory exists
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });

    const writeStream = fs.createWriteStream(outputPath);

    await pipeline(response.Body as any, writeStream);

    const stats = fs.statSync(outputPath);
    if (stats.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    console.log(`Downloaded: ${key} → ${outputPath}`);
  } catch (error) {
    console.error("S3 Download Error:", error);
    throw error;
  }
};