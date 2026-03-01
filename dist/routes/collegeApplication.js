"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collegeApplicationController_1 = require("../controllers/collegeApplicationController");
const router = (0, express_1.Router)();
router.post('/', collegeApplicationController_1.submitCollegeApplication);
exports.default = router;
//# sourceMappingURL=collegeApplication.js.map