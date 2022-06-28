const akun = require('../models/akun')
const bcrypt = require('bcrypt')

async function loginRequired(req, res, next) {

	if(!req.session.username) {
		return res.redirect('/login')
	}

	const conn = req.app.get('connection')
	const [data] = await akun.findByUsername(conn, req.session.username)

	if(!data) {
		return res.redirect('/login')
	}

	res.locals.user = data
	next()
}

async function logout(req, res, next) {
	req.session.reset()
	req.session.destroy()

	res.redirect('/')
}

function guard(role) {
	return function(req, res, next) {
		if(req.session.role != role) {
			res.redirect('/')
			return
		}

		next()
	}
}

const handleResetPassword = async (req, res, next) => {
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
		id: req.session.id,
		password: hashed
	})

	if(err) {
		next(err)
	}

	if(req.session.role == 'admin') return res.redirect('/dashboard-admin')

	return res.redirect('/')
}

module.exports = {loginRequired, logout, guard, handleResetPassword}