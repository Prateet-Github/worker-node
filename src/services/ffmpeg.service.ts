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