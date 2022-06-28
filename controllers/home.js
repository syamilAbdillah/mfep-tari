const router = require('express').Router()
const loker = require('../models/loker')
const kandidat = require('../models/kandidat')
const posisi = require('../models/posisi')

router.get('/', async (req, res, next) => {
	const conn = req.app.get('connection')
	
	const [totalLoker, err1] = await loker.count(conn)
	const [totalPosisi, err2] = await posisi.count(conn)
	const [totalKandidat, err3] = await kandidat.count(conn)

	if (err1 || err2 || err3) {
		return next(err1 || err2 || err3)
	}

	res.render('dashboard-admin', {
		totalKandidat,
		totalPosisi,
		totalLoker,
	})
})

module.exports = router 
