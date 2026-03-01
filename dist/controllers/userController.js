"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const newUser = new User_1.default({ name, email });
        await newUser.save();
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};
exports.createUser = createUser;
//# sourceMappingURL=userController.js.map