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
	const username = req.body.username.trim()
	const password = req.body.password
	const confirm = req.body.confirm

	if(username.length < 4) return next(new Error('username minimal terdiri 4 karakter'))
	if(password.length < 4) return next(new Error('password minimal terdiri 4 karakter'))
	if(confirm != password) return next(new Error('password dan konfirmasi password tidak cocok'))

	const conn = req.app.get('connection')
	const salt = await bcrypt.genSalt(10)
	const hashed = await bcrypt.hash(password, salt)
	const [result, err] = await admin.create(conn, {
		username,
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
	const password = req.body.password
	const confirm = req.body.confirm
	const username = req.body.username.trim()

	if(password != confirm) return next(new Error('password dan konfirmasi password tidak cocok'))
	if(password.length < 4) return next(new Error('password minimal memiliki 4 karakter'))
	if(username.length < 4) return next(new Error('username minimal memiliki 4 karakter'))

	const salt = await bcrypt.genSalt(10)
	const hashed = await bcrypt.hash(password, salt)
	const [_, err] = await admin.update(conn, {
		id: req.params.id,
		username,
		password: hashed,
	})

	if(err) return next(err)

	res.redirect('/dashboard-admin/admin')
})

router.post('/delete/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [result, err] = await admin.remove(conn, req.params.id)

	if(err) {
		return next(err)
	}

	res.redirect('/dashboard-admin/admin')
})

module.exports = router