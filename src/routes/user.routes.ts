import {Router} from "express";
import UserController from "../controller/user.controller";

const router = Router();

router.post('/user/:userId', PostController.updateUser);

export default router;