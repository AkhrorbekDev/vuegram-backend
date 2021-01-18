const express = require('express');
const PostController = require('../controllers/PostController');

const router = express.Router();

router.get('/', PostController.getPosts);
// router.get('/', PostController.getPost);
router.post('/', PostController.createPost);
router.delete('/', PostController.deletePost);

module.exports = router;