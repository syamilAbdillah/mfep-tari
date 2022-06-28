exports.findById = async (conn, id) => {
	const QUERY = `
	SELECT * FROM kandidat 
	INNER JOIN akun ON kandidat.akun_id = akun.id
	WHERE akun_id = ?
	LIMIT 1
	`

	try {
		const [[kandidat], fields] = await conn.query(QUERY, [id])

		if(!kandidat) throw new Error('username tidak ditemukan')

		return [kandidat, null]
	} catch(error) {
		console.log(error)
		return [null, error]
	}
}


exports.create = async (conn, {username, nama, password, telpon, email, cv}) => {
	try {
		await conn.beginTransaction()

		const [akun, fields] = await conn.execute(
			`INSERT INTO akun (username, password, role) VALUES (?,?,?)`, 
			[username, password, 'kandidat']
		)

		const [kandidat, _] = await conn.execute(
			`INSERT INTO kandidat (akun_id, nama, telpon, email, cv) VALUES (?,?,?,?,?)`,
			[akun.insertId, nama, telpon, email, cv]
		)

		await conn.commit()

		return [{id: akun.insertId, username, role: 'kandidat'}, null]
	} catch(error) {
		await conn.rollback()
		return [null, error]
	}
}


exports.updateProfile = async (conn, {nama, email, telpon, akun_id}) => {
	const QUERY = `
	UPDATE kandidat SET nama = ?, email = ?, telpon = ? WHERE akun_id = ?
	`

	try {
		const [res] = await conn.execute(QUERY, [nama, email, telpon, akun_id])
		return [res, null]
	} catch(error) {
		return [null, error]
	}
}


exports.updateCv = async (conn, {akun_id, cv}) => {
	const QUERY = `
	UPDATE kandidat SET cv = ? WHERE akun_id = ?
	`

	try {
		const [res] = await conn.execute(QUERY, [cv, akun_id])
		return [res, null]	
	} catch(error) {
		return [null, error]
	}
}


exports.findAll = async (conn) => {
	const QUERY = `
	SELECT * FROM kandidat 
	INNER JOIN akun ON kandidat.akun_id = akun.id
	`

	try {
		const [res, _] = await conn.query(QUERY)
		return [res, null] 	
	} catch(error) {
		return [null, error]
	}
}


exports.count = async (conn) => {
	const QUERY = `
	SELECT COUNT(akun_id) AS total FROM kandidat
	`
	try {
		const [[res]] = await conn.query(QUERY)
		return [res.total, null]	
	} catch(error) {
		return [null, error]
	}
}


exports.remove = async (conn, id) => {
	const DELETE_EVALUASI = `DELETE FROM evaluasi WHERE kandidat_id = ?`
	const DELETE_LAMARAN = `DELETE FROM lamaran WHERE kandidat_id = ?`
	const DELETE_KANDIDAT = `DELETE FROM kandidat WHERE akun_id = ?`
	const DELETE_AKUN = `DELETE FROM akun WHERE id = ?`

	try {
		await conn.beginTransaction()

		await conn.execute(DELETE_EVALUASI, [id])
		await conn.execute(DELETE_LAMARAN, [id])
		await conn.execute(DELETE_KANDIDAT, [id])
		await conn.execute(DELETE_AKUN, [id])

		await conn.commit()	

		return [{id}, null]
	} catch(error) {
		await conn.rollback()
		return [null, error]
	}
}