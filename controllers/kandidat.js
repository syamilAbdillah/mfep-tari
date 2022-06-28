const router = require('express').Router()
const bcrypt = require('bcrypt')
const upload = require('./upload')
const kandidat = require('../models/kandidat')
const akun = require('../models/akun')
const printPdf = require('../utils/printPdf')
const uploadFile = require('../utils/uploadFile')
const emailValidation = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
const telponValidation = new RegExp(/^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/)

router.get('/', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await kandidat.findAll(conn)

	if(err) return next(err)

	res.render('kandidat/index', {data})
})

router.get('/new', async (req, res, next) => res.render('kandidat/new'))

router.post('/new', upload.single('cv'), async (req, res, next) => {
	req.body.username = req.body.username.trim()
	req.body.nama = req.body.nama.trim()
	req.body.email = req.body.email.trim()
	req.body.telpon = req.body.telpon.trim()
	req.body.password = req.body.password.trim()

	if(req.body.username.length < 4) return next(new Error('username harus memiliki minimal panjang 4 karakter'))
	if(req.body.nama.length < 1) return next(new Error('Nama Lengkap tidak boleh kosong'))
	if(!emailValidation.test(req.body.email)) return next(new Error('format email tidak valid'))
	if(!telponValidation.test(req.body.telpon)) return next(new Error('format telpon tidak valid'))
	if(req.body.password.length < 4) return next(new Error('password harus memiliki panjang 4 karakter'))
	if(req.body.password != req.body.confirm) return next(new Error('konfirmasi password anda salah'))

	const conn = req.app.get('connection')

	const [isExist, error] = await akun.findByUsername(conn, req.body.username)

	if(isExist) {
		return next(new Error('username already exist'))
	}

	if(error && error.message != 'akun tidak ditemukan') {
		return next(error)
	}

	const salt = await bcrypt.genSalt(10)
	const hashed = await bcrypt.hash(req.body.password, salt)

	uploadFile(req.file.buffer)
		.then(async result => {
			const [_, err] = await kandidat.create(conn, {
				...req.body, 
				password: hashed, 
				cv: result.secure_url,
			})
			
			if(err) throw err

			res.redirect('/dashboard-admin/kandidat')
		})
		.catch(error => {
			next(error)
		})
})

router.get('/edit/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await kandidat.findById(conn, req.params.id)
	if(err) return next(err)

	res.render('kandidat/edit', {data})
})

router.post('/edit/:id', async (req, res, next) => {
	const conn = req.app.get('connection')

	req.body.username = req.body.username.trim()
	req.body.nama = req.body.nama.trim()
	req.body.email = req.body.email.trim()
	req.body.telpon = req.body.telpon.trim()

	if(req.body.username.length < 4) return next(new Error('username minimal 4 karakter'))
	const [isExist] = await akun.findByUsername(conn, req.body.username)

	if(req.body.nama.length < 1) return next(new Error('Nama Lengkap tidak boleh kosong'))
	if(!emailValidation.test(req.body.email)) return next(new Error('format email tidak valid'))
	if(!telponValidation.test(req.body.telpon)) return next(new Error('format telpon tidak valid'))

	const [_, err] = await kandidat.updateProfile(conn, {...req.body, akun_id: req.params.id})
	
	if(err) return next(err)

	res.redirect('/dashboard-admin/kandidat')
})

router.post('/edit/:id/reset-password', async (req, res, next) => {
	const conn = req.app.get('connection')

	if (req.body.password < 4) {
		return next(new Error('panjang minimal password 4 char'))
	}

	if (req.body.password != req.body.confirm) {
		return next(new Error('konfirmasi password tidak sama dengan password'))
	}

	const salt = await bcrypt.genSalt(10)
	const hashed = await bcrypt.hash(req.body.password, salt)

	const [_, err] = await akun.updatePassword(conn, {
		id: req.params.id,
		password: hashed
	})

	if(err) {
		next(err)
	}

	res.redirect('/dashboard-admin/kandidat')
})

router.post('/edit/:id/update-cv', upload.single('cv'), async (req, res, next) => {
	const conn = req.app.get('connection')
	
	uploadFile(req.file.buffer)
		.then(async result => {
			const [_, err] = await kandidat.updateCv(conn, {
				akun_id: req.params.id,
				cv: result.secure_url,
			})

			if(err) throw err

			res.redirect('/dashboard-admin/kandidat')
		})
		.catch(error => next(error))
})

router.post('/delete/:id', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [_, err] = await kandidat.remove(conn, req.params.id)

	if(err) return next(err)

	res.redirect('/dashboard-admin/kandidat')
})

router.get('/laporan', async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await kandidat.findAll(conn)

	if (err) {
		return next(err)
	}

	printPdf(res, 'pelamar-terdaftar.ejs', {data, title: 'Laporan Pelamar Terdaftar'})
})

module.exports = router