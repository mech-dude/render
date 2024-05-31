// Function to convert 12-hour time string to 24-hour format
function convertTo24Hour(timeString) {
    if (typeof timeString !== 'string') {
        throw new Error(`Expected a string, but received ${typeof timeString}`);
    }

    let [time, modifier] = timeString.split(' ');
    if (!time || !modifier) {
        throw new Error('Invalid time string format');
    }

    let [hours, minutes, seconds] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    // Ensure two-digit formatting for hours, minutes, and seconds
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

// Function to convert 24-hour time string to total seconds since midnight
function timeStringToSeconds(timeString) {
    if (typeof timeString !== 'string') {
        throw new Error(`Expected a string, but received ${typeof timeString}`);
    }

    let [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

export { convertTo24Hour, timeStringToSeconds };