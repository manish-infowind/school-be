"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuthController_1 = require("../controllers/adminAuthController");
const adminProfileController_1 = require("../controllers/adminProfileController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Authentication
router.post('/login', adminAuthController_1.login);
router.post('/auth/logout', auth_1.authenticate, adminAuthController_1.logout);
// Password Management
router.post('/forgot-password', adminAuthController_1.forgotPassword);
router.post('/change-password', auth_1.authenticate, adminProfileController_1.changePassword);
// Profile Module
router.get('/admin-profile', auth_1.authenticate, adminProfileController_1.getProfile);
router.put('/admin-profile', auth_1.authenticate, adminProfileController_1.updateProfile);
router.post('/admin-profile/avatar', auth_1.authenticate, adminProfileController_1.uploadAvatar);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map