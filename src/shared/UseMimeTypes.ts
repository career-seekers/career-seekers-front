export const mimeMap: Record<string, string> = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
};

export function getExtensionFromMimeType(mimeType: string): string {
  return mimeMap[mimeType.toLowerCase()] || '';
}