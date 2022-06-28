const router = require('express').Router()
const bcrypt = require('bcrypt')
const admin = require('../models/admin')

router.get('/', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [admins, err] = await admin.findAll(conn, req.session.id)

	if(err) {
		return next(err)
	}

	res.render('admin/index', {admins})
})

router.get('/new', async (req, res, next) => {
	res.render('admin/new')
})

router.post('/new', async (req, res, next) => {
	const conn = req.app.get('connection')
	const salt = await bcrypt.genSalt(10)
	const hashed = await bcrypt.hash(req.body.password, salt)
	const [result, err] = await admin.create(conn, {
		username: req.body.username.trim(),
		password: hashed,
	})

	if(err) {
		return next(err)
	}

	res.redirect('/dashboard-admin/admin')
})

router.get('/edit/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await admin.findById(conn, req.params.id)

	if(err) {
		return next(err)
	}

	res.render('admin/edit', {data})
})

router.post('/edit/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const password = req.body.password.trim()
	req.body.username = req.body.username.trim()
	const confirm = req.body['confirm-password']

	if(password != confirm) return next(new Error('password dan konfirmasi password tidak cocok'))
	if(password.length < 4) return next(new Error('password minimal memiliki 4 karakter'))
	if(req.body.username.length < 4) return next(new Error('username minimal memiliki 4 karakter'))

	const salt = await bcrypt.genSalt(10)
	const hashed = await bcrypt.hash(password, salt)
	const [_, err] = await admin.update(conn, {
		id: req.params.id,
		username: req.body.username,
		password: hashed,
	})

	if(err) return next(err)

	res.redirect('/dashboard-admin/admin')
})

router.get('/delete/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [result, err] = await admin.remove(conn, req.params.id)

	if(err) {
		return next(err)
	}

	res.redirect('/dashboard-admin/admin')
})

module.exports = router