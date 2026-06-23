"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.create(data);
        });
    }
    findAll() {
        return __awaiter(this, arguments, void 0, function* (query = {}, options = {}) {
            const result = yield this.model.find(query, null, options).exec();
            return result !== null && result !== void 0 ? result : [];
        });
    }
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(query).exec();
        });
    }
    findOnePopulated(query, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.model
                .findOne(query)
                .populate(populate.path, populate.select)
                .lean());
        });
    }
    findOnePopulatedMany(query, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            let q = this.model.findOne(query);
            for (const p of populate) {
                q = q.populate(p.path, p.select);
            }
            return (yield q.lean());
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id).exec();
        });
    }
    exists(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.exists(filter);
            return !!result;
        });
    }
    countDocuments() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            return this.model.countDocuments(filter).exec();
        });
    }
    findOneAndUpdate(filter_1, update_1) {
        return __awaiter(this, arguments, void 0, function* (filter, update, options = { new: true }) {
            return yield this.model.findOneAndUpdate(filter, update, Object.assign({ new: true }, options)).exec();
        });
    }
    findByIdAndUpdate(id, update, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, update, options).exec();
        });
    }
    updateAll(filter, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!filter || Object.keys(filter).length === 0) {
                throw new Error('updateAll requires a filter to prevent accidental full updates');
            }
            const result = yield this.model.updateMany(filter, data).exec();
            return result.modifiedCount;
        });
    }
    findByIdAndDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndDelete(id).exec();
        });
    }
    findOneAndDelete(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOneAndDelete(query).exec();
        });
    }
}
exports.BaseRepository = BaseRepository;
