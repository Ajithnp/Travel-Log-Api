"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class BaseRoute {
    constructor() {
        this._router = (0, express_1.Router)();
    }
    // Method to get the router instance
    get router() {
        return this._router;
    }
}
exports.default = BaseRoute;
