const router = require('express').Router()
const public = require('./public')
const dashboardAdmin = require('./dashboard-admin')
const {loginRequired, guard, logout} = require('./middleware')

router.use('/', public)
router.use('/dashboard-admin', loginRequired, guard('admin'), dashboardAdmin)

module.exports = router