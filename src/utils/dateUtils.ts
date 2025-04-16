// src/utils/dateUtils.ts
// Helper functions for formatting dates and times

/**
 * Format a date range for display
 * @param startDate The start date
 * @param endDate The end date
 */
export function formatDateRange(startDate: Date | null, endDate: Date | null): string {
  if (!startDate) return 'Unknown date';
  
  const start = startDate.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return start;
  }
  
  const end = endDate.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return `${start} - ${end}`;
}

/**
 * Format a time range for display
 * @param startTime The start time
 * @param endTime The end time
 */
export function formatTimeRange(startTime: Date | null, endTime: Date | null): string {
  if (!startTime) return 'Unknown time';
  
  const start = startTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  if (!endTime || startTime.getTime() === endTime.getTime()) {
    return start;
  }
  
  const end = endTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return `${start} - ${end}`;
}