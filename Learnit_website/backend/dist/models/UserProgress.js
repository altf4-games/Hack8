"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProgress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserProgressSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    totalQuestionsAnswered: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastStudyDate: { type: Date, default: Date.now },
    dailyActivity: {
        type: Map,
        of: {
            questionsAnswered: Number,
            correctAnswers: Number,
            incorrectAnswers: Number,
            timeSpent: Number
        },
        default: new Map()
    }
}, {
    timestamps: true
});
UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ lastStudyDate: -1 });
exports.UserProgress = mongoose_1.default.model('UserProgress', UserProgressSchema);
//# sourceMappingURL=UserProgress.js.map