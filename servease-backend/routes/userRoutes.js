const express = require('express');
const { 
  getUsers, 
  getUser, 
  searchProviders, 
  updateUser, 
  deleteUser,
  getUserStats 
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getUsers);
router.get('/search/providers', searchProviders);
router.get('/:id', getUser);
router.get('/:id/stats', getUserStats);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;
