exports.findAll = async (conn) => {
	const QUERY =` 
	SELECT 
		kriteria.id, 
		kriteria.nama, 
		kriteria.bobot, 
		posisi.nama AS nama_posisi, 
		posisi.id AS posisi_id 
	FROM kriteria 
	RIGHT JOIN posisi ON posisi.id= kriteria.posisi_id 
	ORDER BY posisi_id, kriteria.bobot DESC
	`

	try {
		const [result] = await conn.query(QUERY)

		if(!result) throw new Error('error on select join kriteria posisi')

		const obj = {}
		const total_bobot = {}
		result.forEach((r, index) => {
			if(!obj[r.nama_posisi] && !r.id) {
				obj[r.nama_posisi] = {
					id: r.posisi_id,
					nama: r.nama_posisi,
					total_bobot: 0, 
					listKriteria: [],
				}
			}else if(!obj[r.nama_posisi]) {
				obj[r.nama_posisi] = {
					id: r.posisi_id,
					nama: r.nama_posisi,
					total_bobot: r.bobot,
					listKriteria: [
						{ id: r.id, nama: r.nama, bobot: r.bobot }
					]
				}
			} else {
				obj[r.nama_posisi].listKriteria.push({
					id: r.id,
					nama: r.nama,
					bobot: r.bobot,
					posisi_id: r.posisi_id
				})
				obj[r.nama_posisi].total_bobot += r.bobot
			}
		})

		const output = Object.keys(obj).map(key => obj[key]) 
		return [output, null]	
	} catch(error) {
		console.log({error})
		return [null, error]
	}
}







exports.findById = async (conn, id) => {
	const QUERY = `SELECT * FROM kriteria WHERE id=? LIMIT 1`

	try {
		const [[kriteria], _] = await conn.query(QUERY, [id])
		if(!kriteria) throw new Error('kriteria not found')

		return [kriteria, null]	
	} catch(error) {
		return [null, error]
	}
}







exports.create = async (conn, {nama, bobot, posisi_id}) => {
	const QUERY = `INSERT INTO kriteria (nama, bobot, posisi_id) VALUES (?,?,?)`

	try {
		const [result, error] = await conn.execute(QUERY, [nama, bobot, posisi_id])
		
		return [result, error]
	} catch(error) {
		return [null, error]
	}
}







exports.update = async (conn, {nama, bobot, id}) => {
	const QUERY = `UPDATE kriteria SET nama=?, bobot=? WHERE id=?`

	try {
		const [result, error] = await conn.execute(QUERY, [nama, bobot, id])
		if(error) throw error

		return [result, null]	
	} catch(error) {
		return [null, error]
	}
}







exports.remove = async (conn, id) => {
	const QUERY_KRITERIA = `DELETE FROM kriteria WHERE id=?`
	const QUERY_EVALUASI = `DELETE FROM evaluasi WHERE kriteria_id=?`
	try {
		await conn.beginTransaction()
		await conn.execute(QUERY_EVALUASI, [id])
		const [result, error] = await conn.execute(QUERY_KRITERIA, [id])
		if(error) throw error
		await conn.commit()
		return [result, null]	
	} catch(error) {
		await conn.rollback()
		return [null, error]
	}
}