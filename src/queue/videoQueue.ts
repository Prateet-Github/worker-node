import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const videoQueue = new Queue("video-encoding", {
  connection: redisConnection,
});