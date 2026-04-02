export function generateCSV(data: Record<string, any>[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h] ?? '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      })
      .join(',')
  );
  return [headerRow, ...rows].join('\n');
}
