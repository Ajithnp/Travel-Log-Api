"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(http_status_code_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: http_status_code_1.SUCCESS_STATUS.FAILURE,
                message: messages_1.ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED,
            });
            return;
        }
        const { role } = req.user;
        if (allowedRoles.includes(role)) {
            next();
        }
        else {
            const errorMessage = {
                success: http_status_code_1.SUCCESS_STATUS.FAILURE,
                message: messages_1.ERROR_MESSAGES.ACCESS_DENIED,
            };
            res.status(http_status_code_1.HTTP_STATUS.FORBIDDEN).json(errorMessage);
        }
    };
};
exports.authorize = authorize;
