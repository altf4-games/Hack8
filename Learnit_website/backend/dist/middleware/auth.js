"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const firebase_admin_1 = require("../config/firebase-admin");
const app_1 = require("firebase-admin/app");
const serviceAccount = require('../config/firebase-service-account.json');
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)(serviceAccount)
});
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await firebase_admin_1.auth.verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=auth.js.map