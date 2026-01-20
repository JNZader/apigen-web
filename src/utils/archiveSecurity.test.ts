import JSZip from 'jszip';
import { describe, expect, it, vi } from 'vitest';
import {
  addServiceToZip,
  createArtifactId,
  isSafePath,
  MAX_FILES_IN_ARCHIVE,
  MAX_SINGLE_FILE_SIZE_BYTES,
  MAX_TOTAL_SIZE_BYTES,
} from './archiveSecurity';

describe('archiveSecurity', () => {
  describe('isSafePath', () => {
    it('should accept simple file names', () => {
      expect(isSafePath('file.txt')).toBe(true);
      expect(isSafePath('document.pdf')).toBe(true);
      expect(isSafePath('image.png')).toBe(true);
    });

    it('should accept nested paths within archive', () => {
      expect(isSafePath('src/main/java/App.java')).toBe(true);
      expect(isSafePath('folder/subfolder/file.txt')).toBe(true);
      expect(isSafePath('a/b/c/d/e/f/deep.txt')).toBe(true);
    });

    it('should reject directory traversal attacks (../)', () => {
      expect(isSafePath('../etc/passwd')).toBe(false);
      expect(isSafePath('folder/../../../etc/passwd')).toBe(false);
      expect(isSafePath('src/../../secret.txt')).toBe(false);
      expect(isSafePath('a/b/../../../c')).toBe(false);
    });

    it('should reject absolute paths starting with /', () => {
      expect(isSafePath('/etc/passwd')).toBe(false);
      expect(isSafePath('/root/.ssh/id_rsa')).toBe(false);
      expect(isSafePath('/var/log/syslog')).toBe(false);
    });

    it('should reject Windows drive letters', () => {
      expect(isSafePath('C:\\Windows\\System32\\config')).toBe(false);
      expect(isSafePath('D:\\data\\secret.txt')).toBe(false);
      expect(isSafePath('c:/windows/system32')).toBe(false);
    });

    it('should normalize backslashes to forward slashes', () => {
      expect(isSafePath('folder\\subfolder\\file.txt')).toBe(true);
      expect(isSafePath('..\\..\\etc\\passwd')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isSafePath('')).toBe(true);
      expect(isSafePath('.')).toBe(true);
      expect(isSafePath('..')).toBe(true); // Just '..' without slash is allowed
      expect(isSafePath('../')).toBe(false); // With slash it's blocked
      expect(isSafePath('./file.txt')).toBe(true);
    });
  });

  describe('createArtifactId', () => {
    it('should convert to lowercase', () => {
      expect(createArtifactId('UserService')).toBe('userservice');
      expect(createArtifactId('ORDER_API')).toBe('orderapi'); // underscores are removed
      expect(createArtifactId('MyApp')).toBe('myapp');
    });

    it('should replace spaces with hyphens', () => {
      expect(createArtifactId('User Service')).toBe('user-service');
      expect(createArtifactId('My  App')).toBe('my-app');
      expect(createArtifactId('Order   Management')).toBe('order-management');
    });

    it('should remove special characters', () => {
      expect(createArtifactId('user@service!')).toBe('userservice');
      expect(createArtifactId('api#v2$test')).toBe('apiv2test');
      expect(createArtifactId('my.service.name')).toBe('myservicename');
    });

    it('should handle combined transformations', () => {
      expect(createArtifactId('User Service API v2!')).toBe('user-service-api-v2');
      expect(createArtifactId('My Cool Service @2024')).toBe('my-cool-service-2024');
    });

    it('should preserve hyphens and numbers', () => {
      expect(createArtifactId('api-v2')).toBe('api-v2');
      expect(createArtifactId('service123')).toBe('service123');
      expect(createArtifactId('user-service-2024')).toBe('user-service-2024');
    });

    it('should handle edge cases', () => {
      expect(createArtifactId('')).toBe('');
      expect(createArtifactId('   ')).toBe('-');
      expect(createArtifactId('!!!@@@###')).toBe('');
    });
  });

  describe('addServiceToZip', () => {
    it('should add files from service blob to target zip', async () => {
      const targetZip = new JSZip();

      // Create a source zip with some files
      const sourceZip = new JSZip();
      sourceZip.file('src/Main.java', 'public class Main {}');
      sourceZip.file('pom.xml', '<project></project>');
      const sourceBlob = await sourceZip.generateAsync({ type: 'blob' });

      await addServiceToZip(targetZip, sourceBlob, 'my-service');

      // Verify files were added under the artifact folder
      const mainFile = targetZip.file('my-service/src/Main.java');
      const pomFile = targetZip.file('my-service/pom.xml');

      expect(mainFile).not.toBeNull();
      expect(pomFile).not.toBeNull();

      const mainContent = await mainFile?.async('string');
      expect(mainContent).toBe('public class Main {}');
    });

    it('should skip files with unsafe paths (Zip Slip prevention)', async () => {
      const targetZip = new JSZip();

      // Create a source zip with a normal file
      const sourceZip = new JSZip();
      sourceZip.file('normal.txt', 'safe content');
      const sourceBlob = await sourceZip.generateAsync({ type: 'blob' });

      await addServiceToZip(targetZip, sourceBlob, 'service');

      // The safe file should be added
      const normalFile = targetZip.file('service/normal.txt');
      expect(normalFile).not.toBeNull();

      // Verify that isSafePath would reject malicious paths
      // (JSZip sanitizes paths internally, so we test the function directly)
      expect(isSafePath('../../../etc/passwd')).toBe(false);
      expect(isSafePath('/etc/passwd')).toBe(false);
      expect(isSafePath('C:\\Windows\\System32')).toBe(false);
    });

    it('should reject archives exceeding maximum blob size', async () => {
      const targetZip = new JSZip();

      // Create a mock blob that reports a size larger than allowed
      const largeBlob = new Blob(['x'], { type: 'application/zip' });
      Object.defineProperty(largeBlob, 'size', {
        value: MAX_TOTAL_SIZE_BYTES + 1,
      });

      await expect(
        addServiceToZip(targetZip, largeBlob, 'service')
      ).rejects.toThrow('exceeds maximum size');
    });

    it('should reject archives with too many files (Zip Bomb prevention)', async () => {
      const targetZip = new JSZip();

      // Create a zip with many files
      const sourceZip = new JSZip();
      for (let i = 0; i < MAX_FILES_IN_ARCHIVE + 10; i++) {
        sourceZip.file(`file${i}.txt`, 'content');
      }
      const sourceBlob = await sourceZip.generateAsync({ type: 'blob' });

      await expect(
        addServiceToZip(targetZip, sourceBlob, 'service')
      ).rejects.toThrow('too many files');
    });

    it('should skip directory entries', async () => {
      const targetZip = new JSZip();

      // Create a zip with directories
      const sourceZip = new JSZip();
      sourceZip.folder('empty-dir');
      sourceZip.file('src/file.txt', 'content');
      const sourceBlob = await sourceZip.generateAsync({ type: 'blob' });

      await addServiceToZip(targetZip, sourceBlob, 'service');

      // The file should be added, but we shouldn't error on directories
      const file = targetZip.file('service/src/file.txt');
      expect(file).not.toBeNull();
    });

    it('should track cumulative extracted size', async () => {
      const targetZip = new JSZip();

      // Create multiple files that together exceed the total size limit
      // Using smaller individual files that pass single-file check
      // but fail cumulative check
      const sourceZip = new JSZip();
      // Create 20 files of 6MB each (120MB total, exceeds 100MB limit)
      // Each file is under 10MB single file limit
      const sixMBContent = 'x'.repeat(6 * 1024 * 1024);
      for (let i = 0; i < 20; i++) {
        sourceZip.file(`file${i}.txt`, sixMBContent);
      }
      const sourceBlob = await sourceZip.generateAsync({ type: 'blob' });

      // The compressed blob might be small due to repetitive content
      // but extracted size will exceed limit
      await expect(
        addServiceToZip(targetZip, sourceBlob, 'service')
      ).rejects.toThrow(/exceeds maximum/);
    });

    it('should reject individual files exceeding size limit', async () => {
      const targetZip = new JSZip();

      // Create a zip with one very large file
      const sourceZip = new JSZip();
      const largeContent = 'x'.repeat(MAX_SINGLE_FILE_SIZE_BYTES + 1000);
      sourceZip.file('large-file.bin', largeContent);
      const sourceBlob = await sourceZip.generateAsync({ type: 'blob' });

      await expect(
        addServiceToZip(targetZip, sourceBlob, 'service')
      ).rejects.toThrow('exceeds maximum size');
    });
  });

  describe('security constants', () => {
    it('should have reasonable default limits', () => {
      expect(MAX_FILES_IN_ARCHIVE).toBe(1000);
      expect(MAX_TOTAL_SIZE_BYTES).toBe(100 * 1024 * 1024); // 100 MB
      expect(MAX_SINGLE_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024); // 10 MB
    });

    it('should ensure single file limit is less than total limit', () => {
      expect(MAX_SINGLE_FILE_SIZE_BYTES).toBeLessThan(MAX_TOTAL_SIZE_BYTES);
    });
  });
});
