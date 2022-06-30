require('dotenv').config()
const path = require('path')
const mysql = require('mysql2/promise')
const express = require('express')
const sessions = require('client-sessions')
const cookieParser = require('cookie-parser')

const controllers = require('./controllers')

const sessionsConfig = {
	cookieName: 'session',
	secret: process.env.SESSION_SECRET,
	cookie: {
		httpOnly: true,
		ephemeral: true,
	}
}


async function main(){
	try {
		const app = express()
	    const conn = await mysql.createConnection(process.env.DATABASE_URL)

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
			if(!process.env.NODE_ENV) {
				console.log({err})
			} 
			res.cookie('error-message', err.message, {httpOnly: true})
			res.redirect(req.originalUrl)
		})

		const PORT = process.env.PORT || 8080
		app.listen(PORT, () => console.log(`listen to port :${PORT}`))			
	} catch(error) {
		console.log({error})
	}
}

main()
