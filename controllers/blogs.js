const router = require('express').Router()

const { Blog, User } = require('../models')
const { Op } = require('sequelize')

const jwt = require('jsonwebtoken')
const { sequelize } = require('../util/db')

const blogFinder = async (req, res, next) => {
  console.log('etsin blogia id:llä', req.params.id);
  req.blog = await Blog.findByPk(req.params.id)
  console.log('blogi on', req.blog);
  next()
}

// 13.10
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  console.log('authaus:', process.env.SECRET);

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET)
    } catch{
      return res.status(401).json({ error: 'token invalid!' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing!' })
  }
  next()
}

// Task 13.12.
// Modify the routes for retrieving all blogs and all users so that 
// each blog shows the user who added it and each user shows the blogs they have added.
router.get('/', async (req, res) => {
  // 13.13 filtering
  let where = {}
  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: '%' + req.query.search + '%'
          } 
        },
        {
          author: {
            [Op.iLike]: '%' + req.query.search + '%'
          }
        }
    ]
    }
    /* where.title = {
      [Op.iLike]: '%' + req.query.search + '%'
    } 
    where.author = {
      [Op.iLike]: '%' + req.query.search + '%'
    } */
  }
  console.log('MISSÄ PARAMETRI', where.title);
  const blogs = await Blog.findAll({
    include: { // join query
      model: User,
      attributes: { exclude: ['userId'] }
    },
    where,
    // 13.15
    order: sequelize.literal('likes DESC')
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    console.log('decodedtoken: ',req.decodedToken);
    const user = await User.findByPk(req.decodedToken.id)
    console.log(user);
    const blog = await Blog.create({ ...req.body, userId: user.id })
    res.json(blog)
  } catch(error) {
    next(error)
    //return res.status(400).json({ error })
  }
})

router.get('/:id', blogFinder, async (req, res) => {
  //const blog = await Blog.findByPk(req.params.id)
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', blogFinder, tokenExtractor, async (req, res, next) => {
  //const blog = await Blog.findByPk(req.params.id)
  try {
    console.log('decodedtoken: ',req.decodedToken);
    console.log('blogi: ',req.blog);
    /* const user = await User.findByPk(req.decodedToken.id)
    console.log(user); */
    if (req.blog && req.blog.userId === req.decodedToken.id) {
      console.log('okei!');
      await req.blog.destroy()
      /* if (req.blog) {
        await req.blog.destroy()
      } */
      res.status(204).end()
    }
    else {
      console.log('eipä ollu!');
      res.status(400).end()
    }
    
  } catch(error) {
    next(error)
    //return res.status(400).json({ error })
  }
})

router.put('/:id', blogFinder, async (req, res, next) => {
  //const blog = await Blog.findByPk(req.params.id)
  
  try {
    if (req.blog) {
      req.blog.likes = req.body.likes
      await req.blog.save()
      res.json(req.blog)
    } else {
      res.status(404).end()
    }
  } catch(error) {
    next(error)
    //return res.status(400).json({ error })
  }
})

router.put('/api/blogs/:id', async (req, res) => {
  res.send('moi')
})

module.exports = router