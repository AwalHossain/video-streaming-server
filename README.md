# 🎥 MERN Video Streaming Platform 🎥 (ONGOING)

![Project Image](https://github.com/AwalHossain/video_streaming_service_server/assets/80216813/9e6b1889-c9d6-45d8-806e-27865f674912)


## 🌐 Overview

MERN Video Streaming is a cutting-edge, open-source platform for video
streaming, offering a comprehensive, full-stack solution utilizing the latest
MERN stack technologies. With MERN Video Streaming, users can easily upload,
manage, and stream videos on demand, providing a seamless experience. This
project features a video processing capability that provides real-time
notifications upon completion.

The backend is comprised of three services, utilizing Redis messaging for
communication. These include an API server, a video conversion service, and an
HTTP server serving HLS video files. On the client side, the project uses
create-react-app and MUI library, along with socket.io-client and React Context.

## 🌟 Features

- Real-time video processing with notifications upon completion
- Three-tier backend services for API, video conversion, and HTTP serving
- Frontend built with create-react-app and MUI library
- Real-time communication with the API server using socket.io-client and React Context

## 🏗️ Architecture

![Architecture Image](https://user-images.githubusercontent.com/497812/220627727-04a26928-71df-4c9b-9637-92289a2beee2.png)

## 📡 Backend Services

### 🖥️ API Server

The API server is an Expressjs app that uses Joi, Multer, BullMQ, Socket.io, and
MongoDB driver. The server communicates with Redis to process and store data,
and uses MongoDB as the primary database. The database and Redis are spun up via
the docker-compose command.

### 🎞️ Video Processing Service

The Video Conversion Service is a Node.js process responsible for converting videos and managing tasks with the BullMQ library. This service is composed of three parts:

1. **Video Conversion:** Converts any format video into MP4 and applies a watermark if an image is provided.
2. **Adaptive Bitrate Processing:** Transforms the video into adaptive bitrate HLS format (480p & 1080p) for optimal streaming quality.
3. **CDN Upload:** Upon successful conversion, the video is uploaded to a CDN bucket storage. This allows users to stream videos seamlessly from anywhere in the world.

BullMQ manages the job queue, passing one job to the next upon completion, with job data stored in Redis. Please note that this service is not exposed to any HTTP port, ensuring a secure video processing pipeline.


### 🖥️ Frontend app

The client app is based on create-react-app and MUI library. It uses
socket.io-client and React Context to communicate with the API server and
display the video content.

## 🚀 Getting Started

### Prerequisites

To get started with MERN Video Streaming, you will need to have the following
software installed on your local machine:

- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### 🛠️ Built with Open-Source Technologies

MERN Video Streaming has been built with the following open-source technologies:

- [MongoDB](https://www.mongodb.com/) - A document-based database used to store
  user and video data
- [Express](https://expressjs.com/) - A Node.js web application framework used
  for the server-side of the application
- [React](https://reactjs.org/) - A JavaScript library for building user
  interfaces used for the client-side of the application
- [Node.js](https://nodejs.org/en/) - A JavaScript runtime environment used to
  run the server-side code

## 💻 Installation

To run the project locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/AwalHossain/Video_Streaming_With_MERN.git
```

### 2. Install dependencies using npm

#### 2.1 Server dependencies

```bash
cd server
npm install
```

#### 2.2 Client dependencies

```bash
cd client
yarn
```

### 3. Start the database and Redis using docker-compose

```bash
docker-compose up -d
```

### 4. Start the application

#### 4.1 Start the server

This will start all the three backend services.

```bash
cd server
npm run dev
```

#### 4.2 Start the client

```bash
cd client
yarn start
```

### 5. Usage

You can now access the application at http://localhost:3000.

## 🤝 Contributing to MERN Video Streaming

MERN Video Streaming is an open-source project and we welcome contributions from
the community. If you would like to contribute to the project, please refer to
the `CONTRIBUTING.md` file for guidelines.

## 📜 License

MERN Video Streaming is licensed under the MIT License. Please see the `LICENSE`
file for more information.

## 📝 Note
This project is still under development. The README will be updated as the project progresses. Thank you for your interest and stay tuned for more updates!.

This readme file is not finished yet. I will update it as I go along with the
project. Thanks.
