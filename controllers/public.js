const fs = require('fs')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const formatDate = require('../utils/formatDate')
const upload = require('./upload')
const uploadFile = require('../utils/uploadFile')
const { guard, loginRequired, handleResetPassword, logout } = require('./middleware')

const loker = require('../models/loker')
const akun = require('../models/akun')
const kandidat = require('../models/kandidat')
const lamaran = require('../models/lamaran')


const emailValidation = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
const telponValidation = new RegExp(/^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/)
/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/ 
router.get('/login', async (req, res) => {
	if(req.session.role == 'admin') {
		return res.redirect('/dashboard-admin')
	}

	if(req.session.role == 'kandidat') {
		return res.redirect('/')
	}

	res.render('login')
})

router.post('/login', async (req, res, next) => {
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

	if(data.role == 'kandidat') {
		res.redirect('/')
	} else {
		res.redirect('/dashboard-admin')
	}
})

router.post('/logout', loginRequired, logout)
/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/ 





/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/ 
router.get('/register', async (req, res, next) => {
	if(req.session.username) {
		return res.redirect('/')
	}

	res.render('register')
})

router.post('/register', upload.single('cv'), async (req, res, next) => {
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
			const [data, err] = await kandidat.create(conn, {
				...req.body, 
				password: hashed, 
				cv: result.secure_url,
			})

			if(err) throw err

			req.session = data
			res.redirect('/')
		})
		.catch(error => next(error))
})
/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/ 





/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/ 
router.get('/reset-password',loginRequired, guard('kandidat'), async (req, res, next) => {
	res.render('reset-password')
})

router.post('/reset-password',loginRequired, guard('kandidat'), handleResetPassword)
/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/ 





/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/
router.get('/update-cv', loginRequired, guard('kandidat'), async (req, res, next) => {
	res.render('update-cv')
})

router.post('/update-cv',loginRequired, guard('kandidat'), upload.single('cv'), async (req, res, next) => {
	const conn = req.app.get('connection')
	
	uploadFile(req.file.buffer)
		.then(async result => {
			const [_, err] = await kandidat.updateCv(conn, {
				akun_id: req.session.id,
				cv: result.secure_url,
			})

			if(err) throw err

			res.redirect('/profile') 
		})
		.catch(error => {
			next(error)
		})
})
/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/ 





/*
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
*/
router.get('/profile', loginRequired, guard('kandidat'), async (req, res, next) => {
	if(req.session.role != 'kandidat') {
		return res.redirect('/')
	}

	const conn = req.app.get('connection')
	const [dataKandidat, errKandidat] = await kandidat.findById(conn, req.session.id)
	const [dataLamaran, errLamaran] = await lamaran.findByKandidatId(conn, req.session.id)

	if(errKandidat || errLamaran) {
		return next(errKandidat || errLamaran)
	}

	return res.render('profile', {
		kandidat: dataKandidat, 
		listLamaran: dataLamaran,
		status: lamaran.status,
		formatDate,
	})
})

router.get('/profile/update', loginRequired, guard('kandidat'), async (req, res, next) => {
	const conn = req.app.get('connection')
	const [data, err] = await kandidat.findById(conn, req.session.id)
	if(err) return next(err)

	res.render('update-profile', {data})
})

router.post('/profile/update', loginRequired, guard('kandidat'), async (req, res, next) => {
	const conn = req.app.get('connection')
	req.body.nama = req.body.nama.trim()
	req.body.email = req.body.email.trim()
	req.body.telpon = req.body.telpon.trim()

	if(req.body.nama.length < 1) return next(new Error('Nama Lengkap tidak boleh kosong'))
	if(!emailValidation.test(req.body.email)) return next(new Error('format email tidak valid'))
	if(!telponValidation.test(req.body.telpon)) return next(new Error('format telpon tidak valid'))

	const [_, err] = await kandidat.updateProfile(conn, {...req.body, akun_id: req.session.id})
	
	if(err) return next(err)

	res.redirect('/profile')
})

router.post('/:loker_id', loginRequired, guard('kandidat'), async (req, res, next) => {
	if(req.session.role != 'kandidat') {
		return res.redirect('/')
	}

	const conn = req.app.get('connection')
	const [_, err] = await lamaran.create(conn, {
		loker_id: req.params.loker_id,
		kandidat_id: req.session.id,
	})

	if(err) {
		return next(err)
	}

	return res.redirect('/profile')
})

router.get('/', async (req, res, next) => {
	let kandidat_id = 
		req.session.role == 'kandidat' ?
		req.session.id: 
		null;

	const conn = req.app.get('connection')
	const [listLoker, err] = await loker.findAllNow(conn, kandidat_id)

	if(err) {
		return next(err)
	}

	res.render('index', {listLoker, formatDate, status: lamaran.status})
})

module.exports = router