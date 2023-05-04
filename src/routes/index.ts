import {Router} from "express";
import group from "./group.routes";
import post from "./post.routes";

const routes = Router();

routes.use("/group", group);
routes.use("/post", post);

export default routes;
