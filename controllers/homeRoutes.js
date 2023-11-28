const router = require('express').Router();
const sequelize = require('../config/connection');
const { User, Post, Comment } = require('../models');
const { withAuth } = require('../utils/auth');


// GET all posts (by all users) to render to homepage
router.get('/', async (req, res) => {
    try {
        const postData = await Post.findAll({
            include: [
                {
                    model: User,
                    attributes: ['first_name'],
                },
                {
                    model: Comment,
                },
            ],
            // render posts in reverse chronological order
            order: [['date_created', 'DESC']],
        });


        // add a "user_logged_in" flag to each post belong to logged in user
        // in the posts array for the post partial layout
        // by using the session user_id and comparing it to the post's user_id
        const posts = postData.map((post) => {
            const onePost = post.get({ plain: true });
            onePost.user_logged_in = req.session.user_id === post.user_id;
            return onePost;
        });

        res.render('homepage', {
            posts,
            // "logged_in" flag passed to use in main
            logged_in: req.session.logged_in
        });

    } catch (error) {
        res.status(500).json(error);
    }
});


// GET all posts (by logged in user) to render to dashboard
router.get('/dashboard', withAuth, async (req, res) => {
    console.log('req:', req.session.user_id)
    try {
        const postData = await Post.findAll({
            where: {
                user_id: req.session.user_id
            },
            include: [
                {
                  model: User,
                  attributes: ['first_name'],
                },
                {
                    model: Comment,
                },
            ],
            // render posts in reverse chronological order
            order: [['date_created', 'DESC']],
        });

        // add a "user_logged_in" flag to each post in the posts array for the post partial layout
        const posts = postData.map((post) => {
            const onePost = post.get({ plain: true });
            // "req.session.user_id === post.user_id"
            // don't need to do this comparison for the homepage because
            // i've only retrieved posts belonging to the user 
            onePost.user_logged_in = true;
            return onePost;
        });

        console.log('posts:', posts)

      
        res.render('dashboard', {
            posts, // user_logged_in flag attached to posts (for use in post partial)
            // "logged_in" flag passed to use in main
            logged_in: req.session.logged_in
        });

    } catch (error) {
        res.status(500).json(error);
    }
});


// GET one post to render to single-posts layout
router.get('/posts/:id', withAuth, async (req, res) => {
    console.log('req:', req.session.user_id)
    console.log('flag:', req.session.logged_in)
    console.log('post_id:', req.params.id)

    try{ 
        const [postData, commentData] = await Promise.all([
            
            Post.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        attributes: ['first_name'],
                    },
                    {
                        model: Comment
                    },
                ],
            }),

            Comment.findAll({
                where: {
                    post_id: req.params.id,
                },
                include: [
                    {
                        model: User,
                        attributes: ['first_name'],
                    },
                ],
                attributes: ['id', 'date_created', 'content', 'user_id', 'post_id'],
            }),

        ])
        
        // error handling
        if(!postData) {
            res.status(404).json({message: 'No post exists with this id!'});
            return;
        }

        const loggedInUser = req.session.user_id;

        const post = postData.get({ plain: true });
        // user_logged_in flag added to post array for post partial layout
        post.user_logged_in = loggedInUser === post.user_id;
        console.log('post:', post)


        const comments = commentData.map(comment => {
            const oneComment = comment.get({ plain: true });
            // add the 'user_logged_in' flag to each comment
            // user_logged_in flag should be added also if the post_id = logged in user
            oneComment.user_logged_in = loggedInUser === oneComment.user_id || loggedInUser === post.user_id;
            return oneComment;
        });
        console.log('comments:', comments)
        
    
        res.render('single-post', { 
            post, // user_logged_in flag attached to post (for use in post partial) 
            comments, // user_logged_in flag attached to comments (for use in comment partial) 
            // "logged_in" flag passed to use in main
            logged_in: req.session.logged_in,
        });

    } catch (error) {
          res.status(500).json(error);
          console.log(error);
    };     
});



// GET one post to update
router.get('/posts/:id/update', withAuth, async (req, res) => {
    console.log('req:', req.session.user_id)
    console.log('flag:', req.session.logged_in)
    console.log('req.params.id', req.params.id)
    try{ 
        const postData = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['first_name'],
                },
                {
                    model: Comment,
                    include: { 
                        model: User,
                        attributes: ['first_name']
                    },
                    attributes: ['date_created', 'content', 'user_id'],
                },
            ],
        });

        if(!postData) {
            res.status(404).json({message: 'No post exists with this id!'});
            return;
        }
   
        const post = postData.get({ plain: true });

        // check logged in user and owner of post
        if (req.session.user_id !== post.user_id) {
            res.redirect('/test'); 
            return;
        }

        post.logged_in = req.session.logged_in;
        console.log('updatepost:', post)

        res.render('update-post', { 
            post, 
            logged_in: req.session.logged_in
        });

    } catch (error) {
          res.status(500).json(error);
          console.log(error);
    };     
});


// GET one post to delete
router.get('/posts/:id/delete', withAuth, async (req, res) => {
    console.log('req:', req.session.user_id)
    console.log('flag:', req.session.logged_in)
    console.log('req.params.id', req.params.id)
    try{ 
        const postData = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['first_name'],
                },
                {
                    model: Comment,
                    attributes: ['id'],
                    include: { 
                        model: User,
                        attributes: ['first_name']
                    },
                    attributes: ['id', 'date_created', 'content', 'user_id'],
                },
            ],

        });

        if(!postData) {
            res.status(404).json({message: 'No post exists with this id!'});
            return;
        }
   
        const post = postData.get({ plain: true });

        // check logged in user and owner of post
        if (req.session.user_id !== post.user_id) {
            res.redirect('/test'); 
            return;
        }

        post.logged_in = req.session.logged_in;
        console.log('deletepost:', post)

        res.render('delete-post', { 
            post, 
            logged_in: req.session.logged_in
        });

    } catch (error) {
          res.status(500).json(error);
          console.log(error);
    };     
});



// login route
router.get('/login', async (req, res) => {

    // if the user is already logged in, redirect the request to another route
    if (req.session.logged_in) {
        res.redirect('/dashboard');
        return;
    }

    res.render('login'); 
});

  
module.exports = router;
