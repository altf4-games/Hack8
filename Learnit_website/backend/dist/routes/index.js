"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userProgress_1 = __importDefault(require("./userProgress"));
const savedQuestions_1 = __importDefault(require("./savedQuestions"));
const documents_1 = __importDefault(require("./documents"));
const router = express_1.default.Router();
router.get('/', (_req, res) => {
    res.json({ message: 'API is running' });
});
router.use('/user-progress', userProgress_1.default);
router.use('/saved-questions', savedQuestions_1.default);
router.use('/documents', documents_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map