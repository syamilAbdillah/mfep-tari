exports.findAll = async (conn) => {
	const QUERY = 'SELECT * FROM posisi'

	try {
		const [rows] = await conn.execute(QUERY)
		if(!rows) throw new Error('error @findAll')

		return [rows, null]
	} catch(error) {
		return [null, error]			
	}
}

exports.findById = async (conn, id) => {
	const QUERY = 'SELECT * FROM posisi WHERE id=? LIMIT 1'

	try {
		const [[posisi], fields] = await conn.execute(QUERY, [id])
		if(!posisi) throw new Error('posisi doesnt exist')

		return [posisi, null]	
	} catch(error) {
		return [null, error]
	}
}

exports.create = async (conn, { nama }) => {
	const QUERY_INSERT = 'INSERT INTO posisi (nama) VALUES (?)'
	const QUERY_SELECT = `SELECT * FROM posisi WHERE nama = ? LIMIT 1`
	try {
		await conn.beginTransaction()
		
		const [[isExist]] = await conn.query(QUERY_SELECT, [nama])
		if(isExist) throw new Error('nama posisi telah digunakan, tolong gunakan nama lain')

		const [res, err] = await conn.execute(QUERY_INSERT, [nama])
		if(err) throw err

		await conn.commit()
		return [res, null]
	} catch(error) {
		await conn.rollback()
		return [null, error]
	}
}

exports.update = async (conn, { nama, id }) => {
	const QUERY = 'UPDATE posisi SET nama=? WHERE id=?'

	try {
		const [_, err] = await conn.execute(QUERY, [nama, id])
		if(err) throw err 

		return [_, null]
	} catch(error) {
		return [null, error]	
	}
}

exports.remove = async (conn, id) => {
	const QUERY = 'DELETE FROM posisi WHERE id=?'

	try {
		const [_, err] = await conn.execute(QUERY, [id])
		if(err) throw err 

		return [_, null]	
	} catch(error) {
		return [null, error]
	}
}

exports.count = async (conn) => {
	const QUERY = `
	SELECT COUNT(id) AS total FROM posisi
	`
	try {
		const [[res]] = await conn.query(QUERY)
		return [res.total, null]	
	} catch(error) {
		return [null, error]
	}
}