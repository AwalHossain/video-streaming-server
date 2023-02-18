"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = require('http');
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = 4000;
http.listen(port, function () {
    console.log("listening on localhost:" + port);
});
// export default app;
//# sourceMappingURL=app.js.map