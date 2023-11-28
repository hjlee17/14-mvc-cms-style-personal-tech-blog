const router = require('express').Router();
const { User } = require('../../models');
const { Post } = require('../../models');
const { withAuth } = require('../../utils/auth');

// the `/api/users` endpoint
// three post routes for creating a user, logging in, and logging out


// create a new user
router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    /* req.body should look like this
      {
        "first_name": "Yoongi", 
        "last_name": "Min", 
        "email": "suga@bts.kr", 
        "github": "AgustD", 
        "password": "holly"
      }
    */

    req.session.save(() => {
      req.session.user_id = newUser.id;
      req.session.logged_in = true;

      res.status(200).json(newUser);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});



// find existing user to login
router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'No user with that email address. Sign up or please try again.' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect password.' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (error) {
    res.status(400).json(error);
  }
});



// logout
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
      req.session.destroy(() => {
        res.status(204).end();
      });
  } else {
      res.status(404).end();
  }
});



module.exports = router;