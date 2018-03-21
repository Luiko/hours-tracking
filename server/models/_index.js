const moment = require('moment');

function reduceIterationToDay(iterations) {
  return iterations.filter(function ({ start, end }) {
    return isOfThisDay(start, end);
  });
}
function isOfThisDay(start, end, clientDate) {
  return moment(clientDate).isSame(start, 'day') ||
    moment(clientDate).isSame(end, 'day');
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

function iterationToWeek({ start, end }, m) {
  return m.isSame(start, 'week') || m.isSame(end, 'week');
}

function iterationsToWeekSeconds(prev, { start, end }, weekStart, weekEnd, m) {
  const _start = m.isSame(start, 'week')? start: weekStart;
  const _end = m.isSame(end, 'week')? end: weekEnd;
  return prev + (moment(_end).diff(_start, 'seconds'));
}

module.exports = {
  reduceIterationToDay,
  isOfThisDay,
  reduceDaySeconds,
  iterationToWeek,
  iterationsToWeekSeconds
}
