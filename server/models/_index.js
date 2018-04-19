const moment = require('moment');

function reduceIterationToDay(iterations, clientDate) {
  return iterations.filter(function ({ start, end }) {
    return isPointOf('day', start, end, clientDate);
  });
}

function reduceDaySeconds(iterations, clientDate) {
  const seconds = (prev, start, end) => prev + moment(end).diff(start, 's');
  return iterations.reduce(function (prev, { start, end }) {
    const monthDay = moment(clientDate).date();
    const diff = moment(clientDate).utcOffset();
    if (moment(start).utcOffset(diff).date() < monthDay) {
      return seconds(prev, moment(clientDate).startOf('day'), end);
    } else if (moment(end).utcOffset(diff).date() > monthDay) {
      return seconds(prev, start, moment(clientDate).endOf('day'));
    }
    return seconds(prev, start, end);
  }, 0);
}

function isPointOf(interval, start, end, relativeTime) {
  return moment(relativeTime).isSame(start, interval)
      && moment(relativeTime).isSame(end, interval);
} 

function iterationsToWeekSeconds(prev, { start, end }, weekStart, weekEnd, m) {
  const _start = moment(m).isSame(start, 'week')? start: weekStart;
  const _end = moment(m).isSame(end, 'week')? end: weekEnd;
  return prev + (moment(_end).diff(_start, 'seconds'));
}

module.exports = {
  reduceIterationToDay,
  isPointOf,
  reduceDaySeconds,
  iterationsToWeekSeconds
}
