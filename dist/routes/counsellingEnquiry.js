"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const counsellingEnquiryController_1 = require("../controllers/counsellingEnquiryController");
const router = (0, express_1.Router)();
router.post('/', counsellingEnquiryController_1.submitCounsellingEnquiry);
exports.default = router;
//# sourceMappingURL=counsellingEnquiry.js.map