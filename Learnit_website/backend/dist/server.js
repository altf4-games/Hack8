"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./utils/db");
const routes_1 = __importDefault(require("./routes"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use((0, morgan_1.default)('dev'));
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
(0, db_1.connectDB)();
app.use('/api', routes_1.default);
app.use((_req, res) => {
    console.log(`404 - Not Found: ${_req.method} ${_req.url}`);
    res.status(404).json({ message: 'Not Found' });
});
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong!' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});
//# sourceMappingURL=server.js.map