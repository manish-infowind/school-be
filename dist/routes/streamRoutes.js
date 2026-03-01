"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const streamController_1 = require("../controllers/streamController");
const router = (0, express_1.Router)();
router.get('/popular', streamController_1.listPopularStreams);
router.get('/', streamController_1.listStreams);
exports.default = router;
//# sourceMappingURL=streamRoutes.js.map