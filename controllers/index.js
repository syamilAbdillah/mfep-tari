const router = require('express').Router()
const public = require('./public')
const dashboardAdmin = require('./dashboard-admin')
const {loginRequired, guard, logout} = require('./middleware')

router.use('/', public)
router.use(loginRequired)
router.use('/dashboard-admin', guard('admin'), dashboardAdmin)
router.get('/logout', logout)

module.exports = router