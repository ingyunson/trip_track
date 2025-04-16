// src/utils/exifUtils.ts

/**
 * Check if the file type is valid
 */
export const isValidFileType = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    return validTypes.includes(file.type);
  };
  
  /**
   * Check if the file size is under max size (10MB)
   */
  export const isValidFileSize = (file: File): boolean => {
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSizeInBytes;
  };
  
  /**
   * Extracting EXIF data from image file
   * This is a mock implementation; real version would use exif-js or similar library
   */
  export const extractExifData = async (file: File): Promise<{
    timestamp: Date | null;
    latitude: number | null;
    longitude: number | null;
  }> => {
    return new Promise((resolve) => {
      // Use file name to create deterministic behavior instead of random
      // This makes the mock at least use the file parameter
      const fileName = file.name.toLowerCase();
      const fileSize = file.size;
      
      // Mock implementation - in a real app, use a proper EXIF library
      setTimeout(() => {
        // Derive "hasExif" from filename to make it deterministic
        const hasExif = !(fileName.includes('noexif') || fileSize % 5 === 0);
        
        if (hasExif) {
          // Create a timestamp based on file's last modified date if available
          const timestamp = file.lastModified ? 
            new Date(file.lastModified) : 
            new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
          
          resolve({
            timestamp,
            latitude: 35.6762 + (Math.random() * 0.1 - 0.05),  // Tokyo area
            longitude: 139.6503 + (Math.random() * 0.1 - 0.05)
          });
        } else {
          resolve({
            timestamp: null,
            latitude: null,
            longitude: null
          });
        }
      }, 500 + Math.random() * 1000); // Simulate processing time
    });
  };