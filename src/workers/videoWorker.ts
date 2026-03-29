import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { downloadFromS3 } from "../services/s3.service";
import { generateThumbnail } from "../services/ffmpeg.service";
import { convertToHLS } from "../services/ffmpeg.service";
import path from "path";

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, s3Key } = job.data;

    console.log("Processing video:", videoId);

    // 1. Download from S3
    const inputPath = path.join("/tmp", `${videoId}.mp4`);
    await downloadFromS3(s3Key, inputPath);
    console.log("Downloaded video to:", inputPath);

    // 2. FFmpeg: Generate Thumbnail
    const thumbnailDir = path.join("/tmp", `${videoId}-thumb`);

    const thumbnailPath = await generateThumbnail(
      inputPath,
      thumbnailDir
    );

    console.log("Thumbnail generated at:", thumbnailPath);

    // 3. FFmpeg: Transcode to HLS (.m3u8 + .ts)
    const inputVideoPath = path.join("/tmp", `${videoId}.mp4`);
    const hlsOutputDir = path.join("/tmp", `${videoId}-hls`);

    const hlsPath = await convertToHLS(inputVideoPath, hlsOutputDir);
    
    console.log("HLS generated at:", hlsPath);

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