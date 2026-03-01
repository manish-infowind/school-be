"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const router = (0, express_1.Router)();
router.get('/', eventController_1.listUpcomingAndRunningEvents);
router.get('/:id', eventController_1.getEventDetails);
exports.default = router;
//# sourceMappingURL=eventRoutes.js.map