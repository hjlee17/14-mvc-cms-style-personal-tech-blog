const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment } = require('../../models');
const { withAuth } = require('../../utils/auth');

// the /api/posts endpoint
// routes for creating (post), updating (put), and deleting (delete) a post


// create a post 
router.post('/create', withAuth, async (req, res) => {

    /* req.body should look like this...
    {
      "title": "first post",
      "date_created": "11-15-2023",
      "content": "this is the content of my first post. here is a second sentence.",
      "user_id": 4
    }
  */

  try {
    const newPostData = await {
      ...req.body,
      user_id: req.session.user_id,
    } 
    
    const newPost = await Post.create(newPostData);


    // send new post as a res
    res.json(newPost);

  } catch (error) {
    res.status(500).json(error);
  }
});



// update a post
router.put('/update/:id', withAuth, async (req, res) => {
  console.log("post update api test'")
  console.log(req.params.id)
  /* req.body should look like this...
  {
    "title": "first post",
    "content": "this is the content of my first post. here is a second sentence.",
  }
*/

try {
  const updatedPost = await Post.update(
    {
      title: req.body.title,
      content: req.body.content
    }, 
    {
      where: {
        id: req.params.id
      }
    }, 
  );

  // error handling
  if(!updatedPost) {
    res.status(404).json({message: 'No post exists with this id!'});
    return;
  }

  // send updated post as a res
  res.json(updatedPost);
  
} catch (error) {
  res.status(500).json(error);
}
});



// delete a post
router.delete('/delete/:id', withAuth, async (req, res) => {
  console.log("post delete api test'")
  console.log(req.params.id)

  /* req.body should look like this...
  {
    "post_id": "",
  }
  */

  try {
    const deletedPost = await Post.destroy(
      {
        where: {
          id: req.body.id
        }
      }, 
    );

    // error handling
    if(!deletedPost) {
      res.status(404).json({message: 'No post exists with this id!'});
      return;
    }

    // send updated post as a res
    res.json(deletedPost);
    
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;