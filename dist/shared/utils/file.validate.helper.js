"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasFile = hasFile;
function hasFile(files, fieldName) {
    return files.some((f) => f.fieldName === fieldName);
}
