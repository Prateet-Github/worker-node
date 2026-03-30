import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { s3 } from "../config/s3";

export const uploadToS3 = async (
  filePath: string,
  key: string,
  contentType: string
) => {
  const fileStream = fs.createReadStream(filePath);
  const stats = fs.statSync(filePath);

  const command = new PutObjectCommand({
    Bucket: process.env.S3_PROD_BUCKET!,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
    ContentLength: stats.size,
  });

  try {
    await s3.send(command);
    console.log(`Uploaded: ${key}`);
    return key;
  } catch (error) {
    console.error(`Upload failed for ${key}:`, error);
    throw error;
  }
};