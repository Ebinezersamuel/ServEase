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

router.use(auth);

router.get('/', getUsers);
router.get('/search/providers', searchProviders);
router.get('/:id', getUser);
router.get('/:id/stats', getUserStats);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
