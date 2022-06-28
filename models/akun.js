exports.findByUsername = async (conn, username) => {
	const QUERY = `SELECT * FROM akun WHERE username=? LIMIT 1`

	try {
		const [[akun], fields] = await conn.query(QUERY, [username])
		if(!akun) throw new Error('akun tidak ditemukan')

		return [akun, null]
	} catch(error) {
		return [null, error]
	}
}

exports.updatePassword = async (conn, { id, password }) => {
	const QUERY = `
	UPDATE akun SET password = ? WHERE id = ?
	`

	try {
		const [res] = await conn.execute(QUERY, [password, id])
		return [res, null]	
	} catch(error) {
		return [null, error]
	}
}