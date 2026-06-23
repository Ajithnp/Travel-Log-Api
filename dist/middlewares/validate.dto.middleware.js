"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDTO = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
const http_status_code_1 = require("../shared/constants/http_status_code");
const validateDTO = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (parsed.body)
            req.body = parsed.body;
        if (parsed.params)
            req.params = parsed.params;
        if (parsed.query)
            Object.assign(req.query, parsed.query);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            // console.log("ZOD ERRORS:", JSON.stringify(error.errors, null, 2));
            next(new AppError_1.AppError(error.errors[0].message, http_status_code_1.HTTP_STATUS.BAD_REQUEST));
            return;
        }
        next(error);
    }
};
exports.validateDTO = validateDTO;
