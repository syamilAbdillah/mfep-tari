const path = require('path')
const ejs = require('ejs')
const pdf = require('html-pdf')


module.exports = function(res, filename, data) {
	const { root } = path.parse(__dirname)
	const dirs = __dirname.substring(root.length).split(path.sep)

	dirs.pop()
	dirs.push('views')
	dirs.push('laporan')
	dirs.push(filename)

	const filepath = path.join(root, ...dirs)
	ejs.renderFile(filepath, data, {}, function(err, html){
		if(err) {
			return res.end(err.message)
		}

		pdf.create(html, { format: 'Letter', base: process.env.HOSTNAME || 'http://localhost:8080/' }).toStream(function(err, stream){
			if(err) {
				return res.end(err.stack)
			}
				
		    res.setHeader('Content-type', 'application/pdf')
			stream.pipe(res)
		})
	})


}