import { videoQueue } from "../queue/videoQueue";

(async () => {
  await videoQueue.add("encode-video", {
    videoId: "123",
    input: "test.mp4",
  });

  console.log("Job added");
})();