const router = require('express').Router()
const posisi = require('./posisi')
const admin = require('./admin')
const kriteria = require('./kriteria')
const kandidat = require('./kandidat')
const loker = require('./loker')
const home = require('./home')
const middleware = require('./middleware')

const printPdf = require('../utils/printPdf')

router.use('/posisi', posisi)
router.use('/admin', admin)
router.use('/kandidat', kandidat)
router.use('/kriteria', kriteria)
router.use('/loker', loker)
router.use('/', home)

router.get('/report/pelamar-terdaftar', (req, res) => {
	printPdf(res, 'pelamar-terdaftar.ejs', {title: 'joko'})
})

router.get('/reset-password', (req, res) => res.render('reset-password'))
router.post('/reset-password', middleware.handleResetPassword)
router.post('/logout', middleware.logout)

module.exports = router