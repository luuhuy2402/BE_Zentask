import express from 'express';
import { activityController } from '../../controllers/activityController';
import { authMiddleware } from "../../middlewares/authMiddleware";
import { activityValidation } from "../../validations/activityValidation";

const router = express.Router();

// Create new activity
router.post('/', authMiddleware.isAuthorized, activityValidation.createNew, activityController.createNew);
// router.post('/', activityValidation.createNew, activityController.createNew);

// Get all activities for a board
// router.get('/board/:boardId',authMiddleware.isAuthorized, activityValidation.getActivitiesByBoard, activityController.getActivitiesByBoard);
router.get('/board/:boardId', activityValidation.getActivitiesByBoard, activityController.getActivitiesByBoard);

// Get activity by ID
router.get('/:id', authMiddleware.isAuthorized, activityValidation.getActivityById, activityController.getActivityById);

export const activityRoute = router;
