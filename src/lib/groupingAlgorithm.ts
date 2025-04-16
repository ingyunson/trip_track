// src/lib/groupingAlgorithm.ts
import { PhotoMetadata } from '@/context/PhotoContext';

// Calculate time difference in hours between two timestamps
export function calculateTimeDifference(timestamp1: Date | null, timestamp2: Date | null): number {
  if (!timestamp1 || !timestamp2) return Infinity;

  const diffMs = Math.abs(timestamp1.getTime() - timestamp2.getTime());
  return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

// Calculate distance in kilometers between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export interface PhotoGroup {
  id: string;
  photos: PhotoMetadata[];
  coverPhoto: PhotoMetadata;
  location: string;
  rating: number | null;
  review: string;
  startTime: Date | null;
  endTime: Date | null;
}

// Group photos by time and location proximity
export function groupPhotosByTimeAndLocation(
  photos: PhotoMetadata[],
  maxHoursDiff: number = 2,
  maxKmDiff: number = 5
): PhotoGroup[] {
  // First, sort photos by timestamp
  const sortedPhotos = [...photos].sort((a, b) => {
    if (!a.timeStamp) return -1;
    if (!b.timeStamp) return 1;
    return a.timeStamp.getTime() - b.timeStamp.getTime();
  });

  const groups: PhotoGroup[] = [];
  let currentGroup: PhotoMetadata[] = [];

  for (const photo of sortedPhotos) {
    // If this is the first photo, start a new group
    if (currentGroup.length === 0) {
      currentGroup = [photo];
      continue;
    }

    // Get the last photo in the current group
    const lastPhoto = currentGroup[currentGroup.length - 1];

    // Calculate time and distance between current and last photo
    const timeDiff = calculateTimeDifference(photo.timeStamp, lastPhoto.timeStamp);
    const distanceDiff = calculateDistance(
      photo.latitude, photo.longitude,
      lastPhoto.latitude, lastPhoto.longitude
    );

    // If within thresholds, add to current group; otherwise, start a new group
    if (timeDiff <= maxHoursDiff && distanceDiff <= maxKmDiff) {
      currentGroup.push(photo);
    } else {
      // Create a new group with the photos we've collected
      if (currentGroup.length > 0) {
        const newGroup: PhotoGroup = createGroupFromPhotos(currentGroup);
        groups.push(newGroup);
      }
      currentGroup = [photo];
    }
  }

  // Add the last group if it has photos
  if (currentGroup.length > 0) {
    const newGroup: PhotoGroup = createGroupFromPhotos(currentGroup);
    groups.push(newGroup);
  }

  return groups;
}

// Helper function to create a group from a collection of photos
function createGroupFromPhotos(photos: PhotoMetadata[]): PhotoGroup {
  // Sort photos by time (just to be safe)
  const sortedPhotos = [...photos].sort((a, b) => {
    if (!a.timeStamp) return -1;
    if (!b.timeStamp) return 1;
    return a.timeStamp.getTime() - b.timeStamp.getTime();
  });

  // Generate a unique ID for the group
  const id = `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Use the first photo as the cover photo
  const coverPhoto = sortedPhotos[0];

  // Extract time range
  const startTime = sortedPhotos[0]?.timeStamp || null;
  const endTime = sortedPhotos[sortedPhotos.length - 1]?.timeStamp || null;

  return {
    id,
    photos: sortedPhotos,
    coverPhoto,
    location: '', // To be filled in later
    rating: null,
    review: '',
    startTime,
    endTime
  };
}
