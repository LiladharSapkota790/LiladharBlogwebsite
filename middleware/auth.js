function authUser(req, res, next) {
    if (req.user === null) {
      console.log(req.user);
      res.status(403)
      return res.send('you are not allowed ')
    }

   res.render("admindashboard1");  }

  function authRole(role) {
    return (req, res, next) => {
      if (req.user.role !== role) {
        res.status(401)
        return res.send('Not allowed')
      }

      next()
    }
  }



  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }

    res.redirect('/login')
  }

  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }







  module.exports = {
    authUser,checkAuthenticated, checkNotAuthenticated,
    authRole
  }
