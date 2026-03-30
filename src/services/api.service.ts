import axios from "axios";

const API_URL = process.env.API_URL!;
const WORKER_SECRET = process.env.WORKER_SECRET!;

export const updateVideoStatus = async (
  videoId: string,
  data: {
    status: "PROCESSING" | "COMPLETED" | "FAILED";
    hlsUrl?: string;
    thumbnailKey?: string;
    processingProgress?: number;
    errorMessage?: string;
  }
) => {
  try {
    const res = await axios.patch(
      `${API_URL}/api/video/${videoId}/update-status`,
      data,
      {
        headers: {
          "x-worker-secret": WORKER_SECRET,
        },
      }
    );

    console.log(`Status updated → ${data.status}`);
    return res.data;

  } catch (error: any) {
    console.error(
      "API update failed:",
      error?.response?.data || error.message
    );
    throw error;
  }
};