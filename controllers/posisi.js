const router = require('express').Router()
const posisi = require('../models/posisi')

router.get('/', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [listPosisi, err] = await posisi.findAll(conn)

	if(err) {
		return next(err)
	}

	res.render('posisi/index', {listPosisi})
})

router.get('/new', async (req, res) => {
	res.render('posisi/new')
})

router.post('/new', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await posisi.create(conn, { nama: req.body.nama })

	if(err) {
		return next(err)
	}

	res.redirect('/dashboard-admin/posisi')
})

router.get('/edit/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await posisi.findById(conn, req.params.id)
	
	if (err) {
		return next(err)
	}

	res.render('posisi/edit', {posisi: data})
})

router.post('/edit/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await posisi.update(conn, {id: req.params.id, nama: req.body.nama})

	if(err) {
		return next(err)
	}

	res.redirect('/dashboard-admin/posisi')
})

router.get('/delete/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await posisi.remove(conn, req.params.id)

	if(err) {
		return next(err)
	}

	res.redirect('/dashboard-admin/posisi')
})

module.exports = router