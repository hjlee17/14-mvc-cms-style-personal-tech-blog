const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment } = require('../../models');
const { withAuth } = require('../../utils/auth');

// the /api/comments endpoint


// create a comment 
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
  console.log('user_id:', req.session.user_id,)

  try {
    const newCommentData = await {
      ...req.body,
      user_id: req.session.user_id,
    } 
    
    const newComment = await Comment.create(newCommentData);

    // send new post as a res
    res.json(newComment);

  } catch (error) {
    res.status(400).json(error);
  }
});



// delete a comment
router.delete('/:id', withAuth, async (req, res) => {
  /* req.body should look like this...
    {
      "id": 4
    }
  */

  try {
    const deletedComment = await Comment.destroy(
      {
        where: {
          id: req.body.id
        }
      }, 
    );

    // error handling
    if(!deletedComment) {
      res.status(404).json({message: 'No comment exists with this id!'});
      return;
    }

    // send updated post as a res
    res.json(deletedComment);
    
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;