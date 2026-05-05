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
exports.hmacProcess = exports.doHashValidation = exports.doHash = void 0;
const bcryptjs_1 = require("bcryptjs");
const { createHmac } = require('crypto');
// Define the function with proper types for value and saltValue
const doHash = (value, saltValue) => __awaiter(void 0, void 0, void 0, function* () {
    // Hash the value using bcryptjs with the given salt value
    const hashResult = yield (0, bcryptjs_1.hash)(value, saltValue); // Using await since hash is async
    return hashResult;
});
exports.doHash = doHash;
const doHashValidation = (value, hashedValue) => __awaiter(void 0, void 0, void 0, function* () {
    // Compare the plain text value with the hashed value
    const validationResult = yield (0, bcryptjs_1.compare)(value, hashedValue); // Use compare to check the password
    return validationResult; // Returns true if they match, false otherwise
});
exports.doHashValidation = doHashValidation;
const hmacProcess = (value, key) => {
    const result = createHmac('sha256', key).update(value).digest('hex');
    return result;
};
exports.hmacProcess = hmacProcess;
