import JSZip from 'jszip';

// Constants for archive safety limits
export const MAX_FILES_IN_ARCHIVE = 1000;
export const MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_SINGLE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validate path doesn't contain directory traversal (Zip Slip prevention)
 * @param filePath - The file path to validate
 * @returns true if the path is safe, false otherwise
 */
export function isSafePath(filePath: string): boolean {
  const normalized = filePath.replaceAll('\\', '/');
  return !normalized.includes('../') && !normalized.startsWith('/') && !normalized.includes(':');
}

/**
 * Create artifact ID from service name (URL-safe, lowercase)
 * @param serviceName - The service name to convert
 * @returns A URL-safe artifact ID
 */
export function createArtifactId(serviceName: string): string {
  return serviceName
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^a-z0-9-]/g, '');
}

/**
 * Add service files to a combined ZIP archive with security validations
 * Prevents Zip Bomb and Zip Slip attacks
 * @param zip - The JSZip instance to add files to
 * @param serviceBlob - The blob containing the service archive
 * @param artifactId - The folder name to use in the archive
 */
export async function addServiceToZip(
  zip: JSZip,
  serviceBlob: Blob,
  artifactId: string,
): Promise<void> {
  // Validate input blob size
  if (serviceBlob.size > MAX_TOTAL_SIZE_BYTES) {
    throw new Error(
      `Service archive exceeds maximum size of ${MAX_TOTAL_SIZE_BYTES / 1024 / 1024}MB`,
    );
  }

  const serviceZip = await JSZip.loadAsync(serviceBlob);
  const folder = zip.folder(artifactId);
  if (!folder) return;

  const files = Object.entries(serviceZip.files);

  // Validate file count to prevent zip bomb
  if (files.length > MAX_FILES_IN_ARCHIVE) {
    throw new Error(`Archive contains too many files (${files.length} > ${MAX_FILES_IN_ARCHIVE})`);
  }

  let totalSize = 0;
  for (const [path, file] of files) {
    // Skip directories
    if (file.dir) continue;

    // Validate path to prevent zip slip attack
    if (!isSafePath(path)) {
      console.warn(`Skipping potentially unsafe path: ${path}`);
      continue;
    }

    const content = await file.async('blob');

    // Validate individual file size
    if (content.size > MAX_SINGLE_FILE_SIZE_BYTES) {
      throw new Error(
        `File ${path} exceeds maximum size of ${MAX_SINGLE_FILE_SIZE_BYTES / 1024 / 1024}MB`,
      );
    }

    // Track total extracted size
    totalSize += content.size;
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      throw new Error(
        `Total extracted size exceeds maximum of ${MAX_TOTAL_SIZE_BYTES / 1024 / 1024}MB`,
      );
    }

    folder.file(path, content);
  }
}
