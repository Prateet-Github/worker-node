import dotenv from "dotenv";

dotenv.config();

export const env = {
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  AWS_REGION: process.env.AWS_REGION || "",
  S3_BUCKET: process.env.S3_BUCKET || "",
};