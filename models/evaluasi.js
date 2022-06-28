exports.create = async (conn, { loker_id, kandidat_id, kriteria_id, nilai }) => {
	const QUERY = `INSERT INTO evaluasi (loker_id, kandidat_id, kriteria_id, nilai) VALUES (?,?,?,?)`

	try {
		await conn.execute(QUERY, [loker_id, kandidat_id, kriteria_id, nilai])
		return [{}, null]
	} catch(error) {
		return [null, error]
	}
}

exports.findById = async (conn, {loker_id, kandidat_id, kriteria_id}) => {
	const QUERY = `
	SELECT 
		evaluasi.*,
		kriteria.nama AS nama_kriteria,
		kandidat.nama AS nama_kandidat
	FROM evaluasi 
	JOIN kandidat ON evaluasi.kandidat_id = kandidat.akun_id 
	JOIN kriteria ON evaluasi.kriteria_id = kriteria.id
	WHERE loker_id = ? 
	AND kandidat_id = ? 
	AND kriteria_id = ? 
	LIMIT 1
	`

	try {
		const [[data]] = await conn.query(QUERY, [loker_id, kandidat_id, kriteria_id])
		return [data, null]	
	} catch(error) {
		return [null, error]
	}
}

exports.update = async (conn, { loker_id, kandidat_id, kriteria_id, nilai }) => {
	const QUERY = `
	UPDATE evaluasi 
	SET nilai = ? 
	WHERE loker_id = ? 
	AND kandidat_id = ? 
	AND kriteria_id = ?
	`

	try {
		const [result] = await conn.execute(QUERY, [nilai, loker_id, kandidat_id, kriteria_id])
		return [result, null]	
	} catch(error) {
		return [null, error]
	}
}

exports.remove = async (conn, { loker_id, kandidat_id, kriteria_id }) => {
	const QUERY = `
	DELETE FROM evaluasi WHERE loker_id = ? AND kandidat_id = ? AND kriteria_id = ?
	`

	try {
		const [result] = await conn.execute(QUERY, [loker_id, kandidat_id, kriteria_id])
		return [result, null]	
	} catch(error) {
		return [error, null]
	}
}