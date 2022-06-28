require('dotenv').config()
const path = require('path')
const mysql = require('mysql2/promise')
const express = require('express')
const sessions = require('client-sessions')
const cookieParser = require('cookie-parser')

const controllers = require('./controllers')

const sessionsConfig = {
	cookieName: 'session',
	secret: '9d0d7902-1355-4ea4-885d-1df898a6c39c',
	cookie: {
		httpOnly: true,
		ephemeral: true,
	}
}

const mysqlConfig = {
	host: 'localhost',
	user: 'root',
	database: 'sipp_mfep'
}

async function main(){
	const app = express()
    const conn = await mysql.createConnection(mysqlConfig)

	app.set('views', path.join(__dirname + '/views'))
	app.set('view engine', 'ejs')
	app.use(express.static('public'))
	app.use(express.urlencoded({ extended: true }))
    app.use(sessions(sessionsConfig))
    app.use(cookieParser())
    app.use((req, res, next) => {
        app.set('connection', conn)
        next()
    })
    app.use((req, res, next) => {
    	res.locals.error = req.cookies['error-message']
    	res.clearCookie('error-message')
    	next()
    })
    app.use((req, res, next) => {
    	res.locals.user = req.session
    	next()
    })

    app.use('/', controllers)

	app.use((err, req, res, next) => {
		console.log({err})
		res.cookie('error-message', err.message, {httpOnly: true})
		res.redirect(req.originalUrl)
	})

	const PORT = process.env.PORT || 8080
	app.listen(PORT, () => console.log(`listen to port :${PORT}`))
}

main()
