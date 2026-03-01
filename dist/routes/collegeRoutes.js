"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collegeController_1 = require("../controllers/collegeController");
const router = (0, express_1.Router)();
router.get('/', collegeController_1.listColleges);
router.get('/:slug', collegeController_1.getCollegeBySlug);
exports.default = router;
//# sourceMappingURL=collegeRoutes.js.map