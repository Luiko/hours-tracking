const { getDaySeconds, getWeekSeconds } = require('../models');
const { hour } = require('../penv');

module.exports = async function updateCookieState(username, request, clientDate) {
  const daySeconds = await getDaySeconds(username, clientDate);
  const weekSeconds = await getWeekSeconds(username, clientDate);
  const weekHours = Math.floor(weekSeconds / hour);
  const remainingTime = hour - (weekSeconds % hour);
  const remaining = (weekSeconds - daySeconds) % hour;
  const dayHours = Math.floor((daySeconds + remaining) / hour);
  request.cookieAuth.set('dayHours', dayHours);
  request.cookieAuth.set('weekHours', weekHours);
  request.cookieAuth.set('remainingTime', remainingTime);
  return { dayHours, weekHours, remainingTime };
};
