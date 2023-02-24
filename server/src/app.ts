import compression from "compression";
import cors from "cors";
import express from "express";
const app = express();

// const http = require('http');

app.use(express.json());
app.use(cors());
app.use(compression());

export default app;
