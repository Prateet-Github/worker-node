import ffmpeg from "../config/ffmpeg";
import fs from "fs";
import path from "path";

export const generateThumbnail = (
  inputPath: string,
  outputDir: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputPath)) {
      return reject(new Error("Input video not found"));
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const thumbnailPath = path.join(outputDir, "thumbnail.jpg");

    console.log(`Generating thumbnail for: ${inputPath}`);

    ffmpeg(inputPath)
      .seekInput(2)
      .frames(1)
      .size("1280x720")
      .outputOptions(["-q:v 2"])
      .output(thumbnailPath)
      .on("end", () => {
        console.log("Thumbnail generated at:", thumbnailPath);
        resolve(thumbnailPath);
      })
      .on("error", (err: Error) => {
        console.error("Thumbnail error:", err);
        reject(err);
      })
      .run();
  });
};

export const convertToHLS = (
  inputPath: string,
  outputDir: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputPath)) {
      return reject(new Error("Input video not found"));
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Starting HLS conversion: ${inputPath}`);

    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-preset veryfast",
        "-crf 23",
        "-profile:v baseline",
        "-level 3.0",
        "-start_number 0",
        "-hls_time 6",
        "-hls_list_size 0",
        "-f hls",
        "-b:a 128k",
        "-hls_segment_filename",
        `${outputDir}/segment_%03d.ts`,
      ])
      .output(`${outputDir}/index.m3u8`)
      .on("start", (cmd: string) =>
        console.log("FFmpeg command:", cmd)
      )
      .on("progress", (p: { percent?: number }) =>
        console.log(`Processing: ${p.percent?.toFixed(2)}%`)
      )
      .on("end", () => {
        console.log("HLS conversion done");
        resolve(`${outputDir}/index.m3u8`);
      })
      .on("error", (err: Error) => {
        console.error("HLS error:", err);
        reject(err);
      })
      .run();
  });
};