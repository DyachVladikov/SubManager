interface CsvRow {
  [key: string]: string | number
}

export function downloadCsv(filename: string, rows: CsvRow[]) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) => {
    const str = String(value)
    return /[",;\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const lines = [headers.join(';'), ...rows.map((row) => headers.map((header) => escape(row[header])).join(';'))]
  const blob = new Blob([String.fromCharCode(0xfeff) + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
