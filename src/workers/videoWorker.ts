import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { encodeVideo } from "../jobs/encodeVideo";

export const videoWorker = new Worker(
  "video-encoding",
  async (job) => {
    await encodeVideo(job.data);
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