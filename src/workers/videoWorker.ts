import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, s3Key } = job.data;

    console.log("Processing video:", videoId);
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

videoWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

videoWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});