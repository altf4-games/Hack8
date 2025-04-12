"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firebase_service_account_json_1 = __importDefault(require("./firebase-service-account.json"));
const app = (0, app_1.initializeApp)({
    credential: (0, app_1.cert)(firebase_service_account_json_1.default)
});
exports.auth = (0, auth_1.getAuth)(app);
//# sourceMappingURL=firebase-admin.js.map