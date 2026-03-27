import dotenv from "dotenv";

dotenv.config();

export const env = {
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: parseInt(process.env.REDIS_PORT!, 10),
  AWS_REGION: process.env.AWS_REGION!,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
  S3_RAW_BUCKET: process.env.S3_RAW_BUCKET!,
  S3_PROD_BUCKET: process.env.S3_PROD_BUCKET!,
};