const Blog = require('./blog')
const User = require('./user')

// määritellään foreign key
// one-to-many suhde User ja Blog välillä - yhdellä userilla monta notea
User.hasMany(Blog)
Blog.belongsTo(User)
Blog.sync({ alter: true }) 
User.sync({ alter: true })

module.exports = {
  Blog, User
}