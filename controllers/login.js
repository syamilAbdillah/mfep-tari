const router = require('express').Router()
const bcrypt = require('bcrypt')
const akun = require('../models/akun')

router.get('/', async (req, res) => {
	if(req.session.role == 'admin') {
		return res.redirect('/dashboard-admin')
	}

	if(req.session.role == 'kandidat') {
		return res.redirect('/dashboard-kandidat')
	}

	res.render('login')
})

router.post('/', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await akun.findByUsername(conn, req.body.username.trim())

	if(err) {
		return next(err)
	}

	const isValid = await bcrypt.compare(req.body.password, data.password)

	if(!isValid) {
		return next(new Error('invalid username / password'))
	}

	req.session = data
	res.locals.user = data

	if(data.role == 'kandidat') {
		res.redirect('/dashboard-kandidat')
	} else {
		res.redirect('/dashboard-admin')
	}
})

module.exports = router