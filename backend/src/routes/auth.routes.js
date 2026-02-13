import { Router } from "express";
import Joi from "joi";
import { validate } from "../middleware/validate.js";
import { login, register } from "../controllers/auth.controller.js";


const router = Router();

router.post(
  "/register",
  validate(
    Joi.object({
      name: Joi.string().min(2).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid("student", "faculty", "admin").required(),
      department: Joi.string().min(2).required(),

      registerNo: Joi.string().allow("").optional(),
      year: Joi.number().optional(),
      section: Joi.string().allow("").optional(),

      adminRegisterCode: Joi.string().allow("").optional()
    })
  ),
  register
);

router.post(
  "/login",
  validate(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    })
  ),
  login
);

export default router;
