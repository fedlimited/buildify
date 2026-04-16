export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
}

export function exportToJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
}

export function printContent(title: string) {
  const style = document.createElement('style');
  style.textContent = `@media print { .no-print { display: none !important; } body { background: white; color: black; } }`;
  document.head.appendChild(style);
  document.title = title;
  window.print();
  document.head.removeChild(style);
}

export function flattenForExport(data: Record<string, unknown>[], excludeKeys: string[] = []): Record<string, unknown>[] {
  return data.map(row => {
    const flat: Record<string, unknown> = {};
    Object.entries(row).forEach(([k, v]) => {
      if (excludeKeys.includes(k)) return;
      if (Array.isArray(v)) {
        flat[k] = v.length;
      } else if (typeof v === 'object' && v !== null) {
        Object.entries(v as Record<string, unknown>).forEach(([sk, sv]) => {
          flat[`${k}_${sk}`] = sv;
        });
      } else {
        flat[k] = v;
      }
    });
    return flat;
  });
}
