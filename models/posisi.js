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
	const QUERY = 'INSERT INTO posisi (nama) VALUES (?)'

	try {
		const [posisi, err] = await conn.execute(QUERY, [nama])
		if(err) throw err

		return [posisi, null]
	} catch(error) {
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