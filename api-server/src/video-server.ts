import { Request, Response } from "express";
import fs from "fs";
import http from "http";
import path from "path";

const PORT = 9000;

const requestListener = function (req: Request, res: Response) {
  const directory = "./uploads/hls";

  const filpath = path.join(directory, req.url);

  fs.exists(filpath, (exists) => {
    if (!exists) {
      console.log("File not found");
      return;
    }

    fs.readFile(filpath, (err, data) => {
      if (err) {
        console.log("Error reading file");
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
        return;
      }

      // cors error
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
      res.setHeader("Access-Control-Max-Age", 2592000); // 30 days
      res.end(data);
    });
  });
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
