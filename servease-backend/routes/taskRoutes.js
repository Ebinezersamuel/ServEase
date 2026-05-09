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

router.get('/', getTasks);
router.get('/user/mytasks', auth, getUserTasks);
router.post('/', auth, createTask);
router.get('/:id', getTask);
router.put('/:id', auth, updateTask);
router.put('/:id/accept', auth, acceptTask);
router.put('/:id/complete', auth, completeTask);
router.put('/:id/cancel', auth, cancelTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
