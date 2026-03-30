import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { downloadFromS3 } from "../services/s3.service";
import { generateThumbnail, convertToHLS } from "../services/ffmpeg.service";
import { uploadToS3 } from "../services/upload.service";
import fs from "fs";
import path from "path";

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, s3Key } = job.data;

    const workDir = path.join("/tmp", videoId);
    const inputPath = path.join(workDir, "raw.mp4");
    const hlsOutputDir = path.join(workDir, "hls");

    try {
      console.log(`Starting job for video: ${videoId}`);

      // 1. Setup workspace
      await fs.promises.mkdir(hlsOutputDir, { recursive: true });

      // 2. Download from S3
      await downloadFromS3(s3Key, inputPath);
      console.log("Download complete");

      // 3. Generate thumbnail + upload
      const thumbPath = await generateThumbnail(inputPath, workDir);

      const thumbnailKey = `thumbnails/${videoId}.jpg`;

      await uploadToS3(thumbPath, thumbnailKey, "image/jpeg");
      console.log("Thumbnail uploaded");

      // 4. Convert to HLS
      await convertToHLS(inputPath, hlsOutputDir);
      console.log("HLS conversion complete");

      // 5. Upload HLS files (parallel)
      const hlsFiles = await fs.promises.readdir(hlsOutputDir);

      await Promise.all(
        hlsFiles.map((file) => {
          const filePath = path.join(hlsOutputDir, file);

          const contentType = file.endsWith(".m3u8")
            ? "application/vnd.apple.mpegurl"
            : "video/mp2t";

          return uploadToS3(
            filePath,
            `videos/${videoId}/${file}`,
            contentType
          );
        })
      );

      console.log("HLS files uploaded");

      // 6. TODO: Update MongoDB status to COMPLETED

      return { status: "success", videoId };

    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error;

    } finally {
      
      // 7. Cleanup
      await fs.promises.rm(workDir, { recursive: true, force: true });
      console.log(`Cleaned up workspace for ${videoId}`);
    }
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