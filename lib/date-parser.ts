/**
 * Parses callback preference string (e.g. "Tomorrow at 10 AM", "today 6 PM", "2 days later")
 * into a Date object (best effort). Defaults to 24 hours from now if unable to parse.
 */
export function parseCallbackPreference(text: string | null): Date | null {
  if (!text) return null;
  
  const clean = text.toLowerCase().trim();
  const now = new Date();
  
  try {
    // 1. Check for specific relative day
    let baseDate = new Date(now);
    let timeString = '';
    
    if (clean.includes('tomorrow')) {
      baseDate.setDate(now.getDate() + 1);
      timeString = clean.replace('tomorrow', '');
    } else if (clean.includes('today')) {
      baseDate = new Date(now);
      timeString = clean.replace('today', '');
    } else if (clean.includes('day after tomorrow')) {
      baseDate.setDate(now.getDate() + 2);
      timeString = clean.replace('day after tomorrow', '');
    } else if (clean.includes('next week')) {
      baseDate.setDate(now.getDate() + 7);
      timeString = clean.replace('next week', '');
    } else {
      // Check for things like "2 days", "3 days"
      const daysMatch = clean.match(/(\d+)\s*day/);
      if (daysMatch && daysMatch[1]) {
        const days = parseInt(daysMatch[1], 10);
        baseDate.setDate(now.getDate() + days);
        timeString = clean.replace(daysMatch[0], '');
      } else {
        timeString = clean;
      }
    }
    
    // 2. Parse time (e.g., "10 am", "6 pm", "14:00")
    let hours = 10; // default to 10 AM
    let minutes = 0;
    
    // Check for am/pm
    const timeMatch = timeString.match(/(\d+)(?::(\d+))?\s*(am|pm)?/);
    if (timeMatch) {
      let rawHours = parseInt(timeMatch[1], 10);
      const rawMinutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];
      
      if (ampm === 'pm' && rawHours < 12) {
        rawHours += 12;
      } else if (ampm === 'am' && rawHours === 12) {
        rawHours = 0;
      }
      
      hours = rawHours;
      minutes = rawMinutes;
    } else if (clean.includes('morning')) {
      hours = 10;
    } else if (clean.includes('afternoon')) {
      hours = 14;
    } else if (clean.includes('evening')) {
      hours = 18;
    }
    
    baseDate.setHours(hours, minutes, 0, 0);
    
    // If the parsed date is in the past (e.g., it parsed "10 am" but it's currently 2 pm today),
    // push it to tomorrow
    if (baseDate.getTime() <= now.getTime() && !clean.includes('today')) {
      baseDate.setDate(baseDate.getDate() + 1);
    }
    
    return baseDate;
  } catch {
    // If anything fails, default to tomorrow at the same time
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return tomorrow;
  }
}
