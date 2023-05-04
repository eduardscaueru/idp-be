import {Router} from "express";
import PostController from "../controller/post.controller";

const router = Router();

router.post('/:groupId', PostController.createPost);

router.patch('/:postId', PostController.likePost);

router.patch('/:postId/unlike', PostController.unlikePost)

export default router;