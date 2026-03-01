"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const locationController_1 = require("../controllers/locationController");
const router = (0, express_1.Router)();
router.get('/countries', locationController_1.getCountries);
router.get('/states', locationController_1.getStates);
router.get('/cities', locationController_1.getCities);
router.get('/courses', locationController_1.getCourses);
exports.default = router;
//# sourceMappingURL=locations.js.map