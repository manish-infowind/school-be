"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enquiryController_1 = require("../controllers/enquiryController");
const router = (0, express_1.Router)();
router.post('/', enquiryController_1.createEnquiry);
exports.default = router;
//# sourceMappingURL=enquiryRoutes.js.map