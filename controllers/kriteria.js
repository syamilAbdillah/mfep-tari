const router = require('express').Router()
const kriteria = require('../models/kriteria')
const posisi = require('../models/posisi')

router.get('/', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, error] = await kriteria.findAll(conn)

	if(error) {
		return next(error)
	}

	res.render('kriteria/index', {data})
})

router.get('/new', async (req, res, next) => {
	const conn = req.app.get('connection')
	let [listPosisi, error] = await posisi.findAll(conn)

	if(!listPosisi) {
		return next(error)
	}

	res.render('kriteria/new', {listPosisi, posisi: req.query.posisi})
})

router.post('/new', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, error] = await kriteria.create(conn, req.body)

	if(error) {
		return next(error)
	}

	res.redirect('/dashboard-admin/kriteria')
})

router.get('/edit/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, error] = await kriteria.findById(conn, req.params.id)

	if(error) {
		return next(error)
	}

	res.render('kriteria/edit', {kriteria: data})
})

router.post('/edit/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, error] = await kriteria.update(conn, {...req.body, id: req.params.id})

	if(error) {
		return next(error)
	}

	res.redirect('/dashboard-admin/kriteria')
})

router.post('/delete/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, error] = await kriteria.remove(conn, req.params.id)

	if(error) {
		return next(error)
	}

	res.redirect('/dashboard-admin/kriteria')
})

module.exports = router