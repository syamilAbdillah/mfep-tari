exports.findAll = async (conn, currSessionId) => {
	const QUERY = `SELECT id, username FROM akun WHERE role='admin' AND id <> ?`

	try {
		const [admins] = await conn.query(QUERY, [currSessionId])

		return [admins, null]	
	} catch(error) {
		console.log({error})
		return [null, error]
	}
}

const findByUsername = async (conn, username) => {
	const QUERY = `SELECT * FROM akun WHERE username=? AND role='admin' LIMIT 1`

	try {
		const [[admin], fields] = await conn.query(QUERY, [username])

		if(!admin) throw new Error('username tidak ditemukan')

		return [admin, null]
	} catch(error) {
		console.log(error)
		return [null, error]
	}
}
exports.findByUsername = findByUsername

exports.findById = async (conn, id) => {
	const QUERY = `
	SELECT id, username, password FROM akun WHERE id = ?
	`

	try {
		const [[admin], _] = await conn.query(QUERY, [id])
		return [admin, null]	
	} catch(error) {
		return [null, error]
	}
}

exports.update = async (conn, {id, username, password}) => {
	const QUERY = `
	UPDATE akun SET username = ?, password = ? WHERE id = ?
	`

	try {
		const [res, _] = await conn.execute(QUERY, [username, password, id])
		return [res, null]	
	} catch(error) {
		return [null, error]
	}
}

exports.create = async (conn, {username, password}) => {
	const QUERY = `INSERT INTO akun (username, password, role) VALUES (?,?, 'admin')`
	const data = [username, password]

	try {
		const [admin, error] = await conn.execute(QUERY, data)
		if(error) throw error

		return [admin, null]
	} catch(error) {
		console.log({error})
		return [null, error]
	}
}

exports.remove = async (conn, id) => {
	const QUERY = `DELETE FROM akun WHERE id=? AND role='admin'`

	try {
		const [result, fields] = await conn.execute(QUERY, [id])

		return [result, null]	
	} catch(error) {
		return [null, error]
	}
}