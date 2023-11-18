const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

// the /api/comments endpoint



// ------------------------------------------------------------------
// FOR TESTING IN INSOMNIA


// GET all comments 
router.get('/', async (req, res) => {
  const commentData = await Comment.findAll({
    include: [{ model: User }],
  });
  res.status(200).json(commentData);
});


// DELETE a comment 
router.delete('/:id', async (req, res) => {
  const deletedComment = await Comment.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.json(deletedComment);
});


// ------------------------------------------------------------------


// CREATE a comment 
router.post('/create', withAuth, async (req, res) => {

    /* req.body should look like this...
    {
      "date_created": "11-15-2023",
      "content": "this is a comment.",
      "user_id": 4,
      "post_id": 4
    }
  */
  console.log('req.body:', req.body)
  // console.log('post_id:', req.params.id)
  console.log('user_id:', req.session.user_id,)
  try {
    const newCommentData = await {
      ...req.body,
      // post_id: req.body.post_id,
      user_id: req.session.user_id,
    } 
    
    const newComment = await Comment.create(newCommentData);

    // send new post as a res
    res.json(newComment);

  } catch (error) {
    res.status(400).json(error);
  }
});




// UPDATE post





// DELETE post






module.exports = router;