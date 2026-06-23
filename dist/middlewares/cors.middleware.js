"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOption = void 0;
const env_1 = require("../config/env");
exports.corsOption = {
    origin: env_1.config.cors.ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTINOS'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
};
