# StreamIt Worker

![worker](public/ss.jpeg)

Background worker service responsible for processing uploaded videos.  
Consumes jobs from the queue, transcodes videos using FFmpeg, and generates HLS streams.

---

## Tech Stack

- Node.js
- FFmpeg
- BullMQ
- Redis
- AWS S3

---

## Features

- Consumes video processing jobs from queue
- Handles CPU-intensive video processing outside the main API
- Transcodes videos into HLS format (m3u8 + segments)
- Generates thumbnails
- Uploads processed assets to S3
- Updates video status (PROCESSING → COMPLETED → FAILED)
- Retry mechanism for failed jobs

---

## Architecture Highlights

- Event-driven processing using Redis + BullMQ
- Decoupled from API (independent worker service)
- Scalable worker instances for parallel processing
- Fault-tolerant job handling