const express = require('express');
const { 
  createTask, 
  getTasks, 
  getTask, 
  getUserTasks,
  updateTask, 
  acceptTask,
  completeTask,
  cancelTask,
  deleteTask 
} = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getTasks);
router.get('/user/mytasks', getUserTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.put('/:id/accept', acceptTask);
router.put('/:id/complete', completeTask);
router.put('/:id/cancel', cancelTask);
router.delete('/:id', deleteTask);

module.exports = router;
