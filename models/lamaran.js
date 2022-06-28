const loker = require('./loker')

const status = {
	MENUNGGU: 'menunggu',
	DITERIMA: 'diterima',
	DITOLAK: 'ditolak'
}

exports.status = status






exports.create = async (conn, { loker_id, kandidat_id }) => {
	const SELECT_QUERY = `SELECT * FROM lamaran WHERE loker_id = ? AND kandidat_id = ?`
	const INSERT_QUERY = `INSERT INTO lamaran (loker_id, kandidat_id, status, tanggal) VALUES (?, ?, ?, ?)`

	try {
		await conn.beginTransaction()

		const [[isExist], fields] = await conn.query(SELECT_QUERY, [loker_id, kandidat_id])
		if(isExist) throw new Error('anda telah membuat lamaran untuk loker tsb')
		const [res, meta] = await conn.execute(INSERT_QUERY, [loker_id, kandidat_id, status.MENUNGGU, new Date()])

		await conn.commit()
		return [res, null]	
	} catch(error) {
		await conn.rollback()
		return [null, error]
	}
}







exports.findByKandidatId = async (conn, kandidat_id) => {
	const QUERY = `
	SELECT
		lamaran.tanggal,
	    lamaran.status,
	    loker.ditutup,
	    posisi.nama,
	    loker.kuota,
	    (
	    	SELECT COUNT(kandidat_id) 
	    	FROM lamaran 
	    	WHERE loker_id = loker.id AND status = ?
	    ) AS total_diterima 
	FROM lamaran 
	INNER JOIN loker ON lamaran.loker_id = loker.id
	INNER JOIN posisi ON loker.posisi_id = posisi.id
	WHERE lamaran.kandidat_id = ?
	ORDER BY lamaran.tanggal
	`

	try {

		const [lamaran, fields] = await conn.query(QUERY, [status.DITERIMA, kandidat_id])	
		return [lamaran, null]
	} catch(error) {
		console.log(error)
		return [null, error]
	}
}







const totalDiterima = async (conn, loker_id) => {
	const QUERY = `
	SELECT COUNT(kandidat_id) AS total_diterima FROM lamaran WHERE loker_id = ? AND status = ?
	`

	try {
		const [[res], _] = await conn.query(QUERY, [loker_id, status.DITERIMA])
		return [res.total_diterima, null]	
	} catch(error) {
		return [null, error]
	}
}
exports.totalDiterima = totalDiterima







exports.update = async (conn, { loker_id, kandidat_id, status: _status }) => {
	const QUERY = `
	UPDATE lamaran SET status = ? WHERE loker_id = ? AND kandidat_id = ?
	`

	try {
		await conn.beginTransaction()
		
		const [dataLoker, err] = await loker.findById(conn, loker_id)
		if(err) throw err

		const [total, err2] = await totalDiterima(conn, loker_id)
		if(err2) throw err2
			
		if((status.DITERIMA == _status) && !(total < dataLoker.kuota)) throw new Error('kuota penerimaan lamaran telah penuh')
		const [res, meta] = await conn.execute(QUERY, [_status, loker_id, kandidat_id])

		await conn.commit()
		return [res, null]	
	} catch(error) {
		await conn.rollback()
		return [null, error]
	}
}
