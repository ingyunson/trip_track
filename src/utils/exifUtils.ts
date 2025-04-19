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
 * Extracting EXIF data from image file using exifr
 */
export const extractExifData = async (file: File): Promise<{
  timestamp: Date | null;
  latitude: number | null;
  longitude: number | null;
}> => {
  // Dynamically import exifr to reduce initial page load size
  const exifr = await import('exifr');
  
  try {
    // Parse GPS and date information from the image
    const exifData = await exifr.default.parse(file, {
      // Only extract the tags we need to improve performance
      pick: ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal', 'CreateDate', 'ModifyDate'],
      silentErrors: true
    });
    
    // Extract location data if available
    const latitude = exifData?.GPSLatitude || null;
    const longitude = exifData?.GPSLongitude || null;
    
    // Try to extract timestamp from various possible fields
    let timestamp = null;
    if (exifData?.DateTimeOriginal) {
      timestamp = new Date(exifData.DateTimeOriginal);
    } else if (exifData?.CreateDate) {
      timestamp = new Date(exifData.CreateDate);
    } else if (exifData?.ModifyDate) {
      timestamp = new Date(exifData.ModifyDate);
    } else if (file.lastModified) {
      // Fallback to file's last modified date if no EXIF date is found
      timestamp = new Date(file.lastModified);
    }
    
    return {
      timestamp,
      latitude,
      longitude
    };
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return {
      timestamp: null,
      latitude: null,
      longitude: null
    };
  }
};