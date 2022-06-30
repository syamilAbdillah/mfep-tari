const router = require('express').Router()
const formatDate = require('../utils/formatDate')
const formatFloat = require('../utils/formatFloat')
const printPdf = require('../utils/printPdf')
const loker = require('../models/loker')
const posisi = require('../models/posisi')
const kriteria = require('../models/kriteria')
const kandidat = require('../models/kandidat')
const evaluasi = require('../models/evaluasi')
const lamaran = require('../models/lamaran')

router.get('/', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, error] = await loker.findAllPosisi(conn)

	if(error) {
		return next(error)
	}

	res.render('loker/index', {data, formatDate})
})

router.get('/posisi/:posisi_id', async (req, res, next) => {
	const conn = req.app.get('connection')

	const [dataPosisi, error] = await posisi.findById(conn, req.params.posisi_id)
	if(!dataPosisi) {
		return next(error)
	}

	const [dataLoker, err] = await loker.findGroupByPosisi(conn, req.params.posisi_id)
	if(err) {
		return next(err)
	}

	res.render('loker/posisi', {data: dataLoker, formatDate, posisi: dataPosisi})
})

router.get('/new', async (req, res, next) => {
	const conn = req.app.get('connection')

	const [listPosisi, error] = await posisi.findAll(conn)
	if(error) {
		return next(error)
	}

	res.render('loker/new', {listPosisi, posisi: req.query.posisi, formatDate})
})

router.post('/new', async (req, res, next) => {
	const conn = req.app.get('connection')
	
	const [_, error] = await loker.create(conn, req.body)
	if(error) {
		return next(error)
	}

	res.redirect('/dashboard-admin/loker')
})

router.get('/:loker_id/kandidat/:kandidat_id/kriteria/:kriteria_id/new', async (req, res, next) => {
	const conn = req.app.get('connection')
	
	const [dataLoker, errLoker] = await loker.findByIdIncludePosisi(conn, req.params.loker_id)
	const [dataKandidat, errKandidat] = await kandidat.findById(conn, req.params.kandidat_id)
	const [dataKriteria, errKriteria] = await kriteria.findById(conn, req.params.kriteria_id)

	const err = errLoker || errKandidat || errKriteria

	if(err) {
		console.log({errLoker, errKandidat, errKriteria})
		return next(errLoker || errKandidat || errKriteria)
	}

	res.render('loker/new-eval', {
		loker: dataLoker,
		kandidat: dataKandidat,
		kriteria: dataKriteria,
		formatDate,
	})
})

router.post('/:loker_id/kandidat/:kandidat_id/kriteria/:kriteria_id/new', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await evaluasi.create(conn, {...req.params, nilai: req.body.nilai})

	if(err) {
		return next(err)
	}

	res.redirect('/dashboard-admin/loker/' + req.params.loker_id)
})

router.get('/:loker_id/kandidat/:kandidat_id/kriteria/:kriteria_id/edit', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await evaluasi.findById(conn, {...req.params})
	if(err) {
		return next(err)
	}

	res.render('loker/edit-eval', {data})
})

router.post('/:loker_id/kandidat/:kandidat_id/kriteria/:kriteria_id/edit', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await evaluasi.update(conn, {...req.params, nilai: req.body.nilai})
	if(err) {
		return next(err)
	}

	res.redirect(`/dashboard-admin/loker/${req.params.loker_id}`)
})

router.post('/:loker_id/kandidat/:kandidat_id/kriteria/:kriteria_id/delete', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await evaluasi.remove(conn, req.params)
	if(err) {
		return next(err)
	}

	res.redirect(`/dashboard-admin/loker/${req.params.loker_id}`)
})

router.get('/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await loker.findDetil(conn, req.params.id) // returning Perlamar
	const [totalDiterima, err2] = await lamaran.totalDiterima(conn, req.params.id)
	const [dataLoker, err3] = await loker.findById(conn, req.params.id)

	if(err || err2 || err3) {
		return next(err || err2 || err3)
	}

	// PERHITUNGAN NILAI AKHIR
	setNilaiAkhir(data)

	// PENGURUTAN BERDASARKAN NILAI AKHIR
	data.sort((a, b) => b.total_nilai - a.total_nilai)

	res.render('loker/detil', {
		data, 
		formatDate,
		formatFloat,
		totalDiterima,
		kuota: dataLoker.kuota,
		loker_id: req.params.id,
		status: lamaran.status,
	})
})

router.get('/:id/laporan', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await loker.findDetil(conn, req.params.id) // returning Perlamar
	const [totalDiterima, err2] = await lamaran.totalDiterima(conn, req.params.id)
	const [dataLoker, err3] = await loker.findById(conn, req.params.id)

	if(err || err2 || err3) {
		return next(err || err2 || err3)
	}

	setNilaiAkhir(data)

	data.sort((a, b) => b.total_nilai - a.total_nilai)

	printPdf(res, 'pelamar-per-loker.ejs', {
		title: 'Laporan Pelamar per Loker',
		data, 
		formatDate,
		formatFloat,
		totalDiterima,
		kuota: dataLoker.kuota,
		loker_id: req.params.id,
		status: lamaran.status,
	})
})

router.post('/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await lamaran.update(conn, {
		loker_id: req.params.id,
		kandidat_id: req.body.kandidat_id,
		status: req.body.status,
	})

	if(err) {
		return next(err)
	}

	res.redirect(`/dashboard-admin/loker/${req.params.id}`)
})

router.get('/:id/edit', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await loker.findByIdIncludePosisi(conn, req.params.id)
	if (err) {
		return next(err)
	}

	res.render('loker/edit', {data, formatDate})
})

router.post('/:id/edit', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await loker.update(conn, {...req.body, id: req.params.id})
	if (err) {
		return next(err)
	}

	res.redirect(`/dashboard-admin/loker/posisi/${req.body.posisi_id}`)
})

router.post('/:id/delete', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await loker.remove(conn, req.params.id)
	if (err) {
		return next(err)
	}

	res.redirect('/dashboard-admin/loker')
})

/*
	Pelamar {
		id: number, 
		nama: string,
		tanggal: date,
		status: enum,
		total_bobot: number,
		list_kriteria: Array<ListKriteriaItem>,
	}

	ListKriteriaItem {
		id: number,
		nama: string,
		bobot: number,
		nilai: number,
	}
*/

function setNilaiAkhir(list_pelamar = [] /*Array<Pelamar>*/) {
	for(let i = 0; i < list_pelamar.length; i++) {
		list_pelamar[i].is_completed = true

		list_pelamar[i].total_nilai = list_pelamar[i].list_kriteria.reduce(function(acc, curr) {
			let nilai = 0

			if(curr.nilai != null) {
				nilai = curr.nilai
			} else {
				list_pelamar[i].is_completed = false
			}

			return acc + ((nilai * curr.bobot) / list_pelamar[i].total_bobot)
		}, 0)
	}
}

module.exports = router