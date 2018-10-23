const moment = require('moment');

function reduceIterationTo(format, iterations, clientDate) {
  return iterations.filter(function ({ start }) {
    return isPointOf(format, start, clientDate);
  });
}

function isPointOf(interval, start, relativeTime) {
  return moment(relativeTime).isSame(start, interval);
}

function reduceDayTo(format, iterations, clientDate) {
  const time = (prev, start, end) => prev + moment(end).diff(start, format);
  return iterations.reduce(function (prev, { start, end }) {
    const monthDay = moment(clientDate).date();
    const diff = moment(clientDate).utcOffset();
    if (moment(start).utcOffset(diff).date() < monthDay) {
      return time(prev, moment(clientDate).startOf('day'), end);
    } else if (moment(end).utcOffset(diff).date() > monthDay) {
      return time(prev, start, moment(clientDate).endOf('day'));
    }
    return time(prev, start, end);
  }, 0);
}

function iterationsToWeekSeconds(prev, { start, end }, weekStart, weekEnd, m) {
  const _start = moment(m).isSame(start, 'week')? start: weekStart;
  const _end = moment(m).isSame(end, 'week')? end: weekEnd;
  return prev + (moment(_end).diff(_start, 's'));
}

module.exports = {
  reduceIterationToDay: reduceIterationTo.bind(null, 'day'),
  reduceIterationToWeek: reduceIterationTo.bind(null, 'week'),
  isPointOf,
  reduceDaySeconds: reduceDayTo.bind(null, 's'),
  reduceDayMillis: reduceDayTo.bind(null, 'x'),
  iterationsToWeekSeconds
}
