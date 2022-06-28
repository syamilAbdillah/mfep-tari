exports.findAllPosisi = async (conn) => {
	const queryPosisi = `SELECT * FROM posisi`
	const queryLoker  = `SELECT id AS loker_id, ditutup, posisi_id FROM loker WHERE ditutup >= NOW()`

	try {
		await conn.beginTransaction()
		const [posisi, posisiMeta] = await conn.query(queryPosisi)
		const [loker, lokerMeta] = await conn.query(queryLoker)
		await conn.commit()

		const result = posisi.map(p => {
			for(let i = 0; i < loker.length; i++) {
				if(p.id == loker[i].posisi_id) {
					p = {...p, ...loker[i]}
					return p
				}
			}
			return p
		})

		return [result, null]
	} catch(error) {
		console.log({error})
		await conn.rollback()
		return [null, error]
	}
}







exports.create = async (conn, {kuota, ditutup, posisi_id}) => {
	const QUERY = `INSERT INTO loker (dibuka, ditutup, kuota, posisi_id) VALUES (NOW(), ?, ?, ?)`
	const data = [ditutup, kuota, posisi_id]

	try {
		let error
		let isExist  

		[isExist, error] = await findLokerByPosisiNow(conn, posisi_id)	
		if(isExist[0] || error) throw new Error('loker sedang dibuka, anda tidak dapat membuka lagi')

		const [result, _] = await conn.execute(QUERY, data)

		if(!result) throw new Error('gagal menambah loker')

		return [result, null] 
	} catch(error) {
		return [null, error]
	}
}







const findLokerByPosisiNow = async (conn, posisi_id) => {
	const QUERY = `SELECT id FROM loker WHERE ditutup >= NOW() AND posisi_id = ?`

	try {
		const [loker, _] = await conn.query(QUERY, [posisi_id])
		return [loker, null]	
	} catch(error) {
		return [null, error]
	}
}








exports.findGroupByPosisi = async (conn, posisi_id) => {
	const QUERY = `SELECT * FROM loker WHERE posisi_id = ? ORDER BY ditutup DESC`

	try {
		const [loker, _] = await conn.query(QUERY, [posisi_id])
		return [loker, null]	
	} catch(error) {
		return [null, error]
	}
}



/*
	SELECT 
	    posisi.nama,
	    loker.*,
	    lamaran.status
	FROM posisi 
	INNER JOIN loker ON loker.id = ( 
	    SELECT 
	        loker.id 
	    FROM loker 
	    WHERE loker.posisi_id = posisi.id 
	    ORDER BY loker.ditutup DESC 
	    LIMIT 1 
	) 
	LEFT JOIN lamaran ON loker.id = lamaran.loker_id AND lamaran.kandidat_id = 10
	ORDER BY loker.ditutup DESC

	SELECT 
	    posisi.nama,
	    loker.*,
	    (SELECT COUNT(kandidat_id) FROM lamaran WHERE loker_id = loker.id AND status = 'diterima') AS total_diterima,
	    CASE 
	    	WHEN loker.kuota = (
	            	SELECT COUNT(kandidat_id) 
	            	FROM lamaran 
	            	WHERE loker_id = loker.id AND status = 'diterima'
	            ) AND lamaran.status = 'menunggu' 
	        	THEN 'ditolak'
	        WHEN NOW() >= loker.ditutup AND lamaran.status = 'menunggu' THEN 'ditolak'
	        WHEN lamaran.status = 'diterima' THEN 'diterima'
	     	WHEN lamaran.status = 'menunggu' THEN 'menunggu'
	        ELSE null
	    END AS status
	FROM posisi 
	INNER JOIN loker ON loker.id = ( 
	    SELECT 
	        loker.id 
	    FROM loker 
	    WHERE loker.posisi_id = posisi.id 
	    ORDER BY loker.ditutup DESC 
	    LIMIT 1 
	) 
	LEFT JOIN lamaran ON loker.id = lamaran.loker_id AND lamaran.kandidat_id = 14
	ORDER BY loker.ditutup DESC
*/



exports.findAllNow = async (conn, kandidat_id = null) => {
	const QUERY = `
	SELECT 
	    posisi.nama,
	    loker.*,
	    (SELECT COUNT(kandidat_id) FROM lamaran WHERE loker_id = loker.id AND status = 'diterima') AS total_diterima,
	    CASE 
	    	WHEN loker.kuota = (
	            	SELECT COUNT(kandidat_id) 
	            	FROM lamaran 
	            	WHERE loker_id = loker.id AND status = 'diterima'
	            ) AND lamaran.status = 'menunggu' 
	        	THEN 'ditolak'
	        WHEN NOW() >= loker.ditutup AND lamaran.status = 'menunggu' THEN 'ditolak'
	        WHEN lamaran.status = 'diterima' THEN 'diterima'
	     	WHEN lamaran.status = 'menunggu' THEN 'menunggu'
	        ELSE null
	    END AS status
	FROM posisi 
	INNER JOIN loker ON loker.id = ( 
	    SELECT 
	        loker.id 
	    FROM loker 
	    WHERE loker.posisi_id = posisi.id 
	    ORDER BY loker.ditutup DESC 
	    LIMIT 1 
	) 
	LEFT JOIN lamaran ON loker.id = lamaran.loker_id AND lamaran.kandidat_id = ?
	ORDER BY loker.ditutup DESC
	`

	try {
		const [loker, _] = await conn.query(QUERY, [kandidat_id])

		return [loker, null]
	} catch(error) {
		return [null, error]
	}
}







exports.findDetil = async (conn, loker_id) => {
	const QUERY = `
	SELECT
	    lamaran.tanggal,
	    lamaran.status,
	    lamaran.kandidat_id,
	    kandidat.nama,
	    kandidat.cv,
	    kandidat.email,
	    kandidat.telpon,
	    kriteria.bobot,
	    kriteria.id AS kriteria_id,
	    kriteria.nama AS nama_kriteria,
	    (
	        SELECT nilai 
	        FROM evaluasi 
	        WHERE kandidat_id = lamaran.kandidat_id 
	        AND loker_id = lamaran.loker_id 
	        AND kriteria_id = kriteria.id
	    ) AS nilai
	FROM lamaran 
	JOIN kandidat ON lamaran.kandidat_id = kandidat.akun_id 
	JOIN loker ON lamaran.loker_id = loker.id 
	JOIN posisi ON loker.posisi_id = posisi.id 
	JOIN kriteria ON posisi.id = kriteria.posisi_id 
	WHERE loker.id = ?
	ORDER BY lamaran.tanggal DESC, lamaran.kandidat_id, kriteria.bobot DESC 
	`
	try {
		const [data, fields] = await conn.query(QUERY, [loker_id])
		
		if(data.length < 1) {
			return [data, null]
		}

		const temp = {}

		for(let i = 0; i < data.length; i++) {
			if(temp[data[i].kandidat_id]) {
				temp[data[i].kandidat_id].list_kriteria.push({
					id: data[i].kriteria_id,
					nama: data[i].nama_kriteria,
					bobot: data[i].bobot,
					nilai: data[i].nilai,
				})

				temp[data[i].kandidat_id].total_bobot += data[i].bobot
			} else {
				temp[data[i].kandidat_id] = {
					id: data[i].kandidat_id,
					nama: data[i].nama,
					email: data[i].email,
					telpon: data[i].telpon,
					cv: data[i].cv,
					tanggal: data[i].tanggal,
					status: data[i].status,
					total_bobot: data[i].bobot,
					list_kriteria: [{
						id: data[i].kriteria_id,
						nama: data[i].nama_kriteria,
						bobot: data[i].bobot,
						nilai: data[i].nilai,
					}]
				}
			}
		}

		const result = Object.keys(temp).map(key => temp[key])
		return [result, null]
	} catch(error) {
		return [null, error]
	}
}






exports.findByIdIncludePosisi = async (conn, loker_id) => {
	const QUERY = `
	SELECT 
		loker.*,
		posisi.nama 
	FROM loker 
	JOIN posisi ON loker.posisi_id = posisi.id 
	WHERE loker.id = ?
	LIMIT 1
	`

	try {
		const [[loker]] = await conn.query(QUERY, [loker_id])
		return [loker, null]	
	} catch(error) {
		console.log(error)
		return [null, error]
	}
}







exports.findById = async (conn, loker_id) => {
	const QUERY = `
	SELECT * FROM loker WHERE id = ? LIMIT 1
	`

	try {
		const [[loker]] = await conn.query(QUERY, [loker_id])	
		return [loker, null]
	} catch(error) {
		return [null, error]
	}
}







exports.update = async (conn, {id, ditutup, kuota}) => {
	const QUERY = `
	UPDATE loker SET ditutup = ?, kuota = ? WHERE id = ?
	`

	try {
		const [result] = await conn.execute(QUERY, [ditutup, kuota, id])
		return [result, null]
	} catch(error) {
		return [null, error]
	}
}






exports.remove = async (conn, id) => {
	const QUERY_LOKER = `
	DELETE FROM loker WHERE id = ?
	`
	const QUERY_LAMARAN = `
	DELETE FROM lamaran WHERE loker_id = ?
	`

	const QUERY_EVALUASI = `
	DELETE FROM evaluasi WHERE loker_id = ?
	`

	try {
		await conn.beginTransaction()

		await conn.execute(QUERY_LAMARAN, [id])
		await conn.execute(QUERY_EVALUASI, [id])
		const [res, _] = await conn.execute(QUERY_LOKER, [id])

		await conn.commit()
		return [res, null]	
	} catch(error) {
		await conn.rollback()
		return [null, error]
	}
}




exports.count = async (conn) => {
	const QUERY = `
	SELECT COUNT(id) AS total FROM loker
	`
	try {
		const [[res]] = await conn.query(QUERY)
		return [res.total, null]
	} catch(error) {
		return [null, error]
	}
}