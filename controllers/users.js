const router = require('express').Router()

const { User, Blog } = require('../models')

// 13.8 List all users
router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: { // join query
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

// 13.8 add new user
router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    console.log('EpäOnnistui!',error);
    next(error)
  }
})

// 13.8 change users name
router.put('/:username', async (req, res) => {
  const username = req.body.username
  try {
    const user = await User.findOne({ // haetaan käyttäjä käyttäjänimen perusteella
      where: {
        username: req.params.username
      }
    })
    user.username = username;
    await user.save()
    res.json(user)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

module.exports = router