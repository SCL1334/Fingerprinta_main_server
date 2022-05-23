const timeStringToMinutes = (timeString) => {
  try {
    const time = timeString.split(':');
    const minutes = parseInt(time[0], 10) * 60 + parseInt(time[1], 10);
    return minutes;
  } catch {
    return null;
  }
};

const getDefaultLeaveHours = (start, end, restStart, restEnd) => {
  let leaveHours = 0;
  const startMin = timeStringToMinutes(start);
  const endMin = timeStringToMinutes(end);
  const restStartMin = timeStringToMinutes(restStart);
  const restEndMin = timeStringToMinutes(restEnd);

  const minToHours = (min) => Math.ceil(min / 60);

  if (startMin < restStartMin && endMin > restEndMin) { // 正常情況 start && end 都不在Rest範圍
    leaveHours = minToHours(restStartMin - startMin + endMin - restEndMin);
  } else if (startMin >= restEndMin || endMin <= restStartMin) { // 沒有重疊到Rest
    leaveHours = minToHours(endMin - startMin);
  } else if (startMin <= restStartMin && endMin < restEndMin) { // end 在 Rest中
    leaveHours = minToHours(restStartMin - startMin);
  } else if (startMin >= restStartMin && endMin <= restEndMin) { // start end 皆落在Rest範圍
    leaveHours = 0;
  } else if (startMin >= restStartMin && endMin > restEndMin) { // start 在Rest中
    leaveHours = minToHours(endMin - restEndMin);
  }
  return leaveHours;
};

const getHalfHourFromStr = (time) => {
  const [hour] = time.split(':');
  return parseInt(hour, 10);
};

const toTime = (halfHour) => {
  const hour = Math.trunc(halfHour / 2);
  const hourStr = (hour < 10) ? `0${hour}` : hour;
  const minute = Math.trunc(((halfHour / 2) % 1) * 60);
  const minStr = (minute < 10) ? `0${minute}` : minute;
  return `${hourStr}:${minStr}`;
};

const getStudentStart = (time, start, LATE_BUFFER) => {
  let minutes = timeStringToMinutes(time) - LATE_BUFFER;
  if (minutes < timeStringToMinutes(start)) { minutes = timeStringToMinutes(start); }
  const hour = Math.ceil(minutes / 30);
  return hour;
};

const getStudentEnd = (time, end) => {
  let minutes = timeStringToMinutes(time);
  if (minutes > timeStringToMinutes(end)) { minutes = timeStringToMinutes(end); }
  const hour = Math.floor(minutes / 30);
  return hour;
};

module.exports = {
  timeStringToMinutes,
  getDefaultLeaveHours,
  getHalfHourFromStr,
  toTime,
  getStudentStart,
  getStudentEnd,
};
