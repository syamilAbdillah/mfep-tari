const multer = require('multer')

const storage = multer.memoryStorage()

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

const upload = multer({ fileFilter, limits, storage })

module.exports = upload