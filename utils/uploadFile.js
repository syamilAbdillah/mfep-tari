const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({ 
	cloud_name: process.env.CN_NAME, 
	api_key: process.env.CN_API_KEY, 
	api_secret: process.env.CN_API_SECRET, 
})

function uploadFile(buffer) {
	return new Promise(function(resolve, reject) {
		try {
			const stream = cloudinary.uploader.upload_stream({ 
				folder: 'mfep_tari', 
				format: 'pdf' 
			}, function(error, result){
				if(result) resolve(result)
				else reject(error)
			})

			streamifier.createReadStream(buffer).pipe(stream)
		} catch(error) {
			reject(error)
		}
	})
}

module.exports = uploadFile

/*
	--- CLOUDINARY SUCCESS RESULT ---
	{
		asset_id: STRING,
		public_id: STRING,
		version: NUMBER,
		version_id: STRING,
		signature: STRING,
		width: NUMBER,
		height: NUMBER,
		format: STRING,
		resource_type: STRING,
		created_at: DATE_STRING,
		tags: ARRAY<ANY>,
		pages: NUMBER,
		bytes: NUMBER,
		type: STRING,
		etag: STRING,
		placeholder: BOOOLEAN,
		url: STRING, // FILE_URL http 
		secure_url: STRING, // FILE URL https, simpen ini ke db
		folder: STRING,
		original_filename: STRING,
		api_key: STRING
	}
*/