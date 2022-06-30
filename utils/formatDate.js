module.exports = function(date, delimiter = '/') {
	const _date = new Date(date)
	const dd = _date.getDate()
	const mm = _date.getMonth() + 1
	const yyy = _date.getFullYear()

	return `${yyy}${delimiter}${mm < 10 ? '0' + mm: mm}${delimiter}${dd < 10 ? '0' + dd: dd}`
}

