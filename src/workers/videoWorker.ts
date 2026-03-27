import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { downloadFromS3 } from "../services/s3.service";
import path from "path";

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, s3Key } = job.data;

    console.log("Processing video:", videoId);

    // 1. Download from S3
    const localFilePath = path.join("/tmp", `${videoId}.mp4`);
    await downloadFromS3(s3Key, localFilePath);
    console.log("Downloaded video to:", localFilePath);

    // 2. FFmpeg: Generate Thumbnail
    // 3. FFmpeg: Transcode to HLS (.m3u8 + .ts)
    // 4. Upload results back to S3
    // 5. Update MongoDB status to 'COMPLETED'

    return { status: "success", videoId };
  },
  {
    connection: redisConnection,
    concurrency: 1,
  }
);

videoWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

videoWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});