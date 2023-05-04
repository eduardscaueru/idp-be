import {Router} from "express";
import GroupController from "../controller/group.controller";

const router = Router();

/* Get a list of all the groups */
router.get('/', GroupController.listAll);

/* Get a group */
router.get('/:groupId', GroupController.getGroup)

router.get('/userNotIn/:userId', GroupController.getGroupsUserNotIn)

router.get('/userIn/:userId', GroupController.getGroupsUserIn)

/* Create group */
router.post('/', GroupController.createGroup);

/* Group join */
router.post('/:groupId/join', GroupController.groupJoin);

/* Returns a list of 10 posts from corresponding group, based on requested index */
router.get('/:groupId/posts/:lastIndex', GroupController.getPosts);

export default router;
