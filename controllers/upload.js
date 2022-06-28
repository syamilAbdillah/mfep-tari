const multer = require('multer')

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dirs = __dirname.split('/')
		dirs.pop()
		dirs.push('public')
		dirs.push('uploads')
		const dest = dirs.join('/')

		cb(null, dest)
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		const ogname = file.originalname.split('.')
		const ext = ogname[ogname.length - 1]
		cb(null, uniqueSuffix + '.' + ext)
	},
})

const fileFilter = (req, file, cb) => {
	if(file.mimetype != 'application/pdf') {
		return cb(new Error('invalid file type'), false)
	}
	cb(null, true)
}

const limits = {
	fileSize: 2 * 1024 * 1024,
	files: 1,
}

const upload = multer({ storage, fileFilter, limits })

module.exports = upload