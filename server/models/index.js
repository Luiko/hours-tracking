const mongoose = require('mongoose');
const accountSchema = require('./schemas/account');
const moment = require('moment');
require('dotenv').config();
const {
  reduceIterationToDay, reduceDaySeconds,
  isPointOf, iterationsToWeekSeconds
} = require('./_index');
const {
  addAccount, getUsers, deleteUser, changePassword
} = require('./account');
const { addIteration } = require('./iteration');
const db = mongoose.connection;

db.on('error', () => console.error('connection error'));
db.once('open', function () {
  console.log('mongoose connection');
});

const Account = mongoose.model('Account', accountSchema);
function connect() {
  mongoose.connect(process.env.STR_DB_CON, { useNewUrlParser: true });
}

function closeConnection() {
  mongoose.connection.close();
};

async function getDaySeconds(username, clientDate) {
  const { iterations } = await Account.findOne({ username });
  const dayIterations = reduceIterationToDay(iterations, clientDate);
  const secondsDay = reduceDaySeconds(dayIterations, clientDate);
  return secondsDay;
};

async function getWeekSeconds(username, clientDate) {
  const { iterations } = await Account.findOne({ username });
  try {
    const m = moment(clientDate);
    const weekStart = moment(m.toDate()).startOf('week');
    const weekEnd = moment(m.toDate()).endOf('week');
    const IsInThisWeek = function ({ start }) {
      return isPointOf('week', start, m);
    };
    const toWeekSeconds = function (accum, data) {
      return iterationsToWeekSeconds(accum, data, weekStart, weekEnd, m);
    };
    const weekIterations = iterations.filter(IsInThisWeek);
    const weekSeconds = weekIterations.reduce(toWeekSeconds, 0);
    return weekSeconds;
  } catch (err) {
    console.error(err.message);
    return err;
  }
}

async function getWeekStats(username, date) {
  const daysnumber = [];
  let relativeday = moment(date).startOf('week');
  while (daysnumber.length < 7) {
    daysnumber.push(relativeday.date());
    relativeday = relativeday.add(1, 'day');
  }

  const user = await Account.findOne({ username }, { iterations: 1 });
  const iterations = [...user.iterations];
  const getmilis = (iter) => (
    new Date(iter.end).getTime()) - (new Date(iter.start).getTime())
  ;
  const weekDaysWithMilis = {
    'sunday': 0, 'monday': 0, 'tuesday': 0,
    'wednesday': 0, 'thursday': 0, 'friday': 0, 'saturday': 0
  };
  const weekdays = Object.keys(weekDaysWithMilis);
  let daysLeft = moment(date).diff(moment(date).startOf('week'), 'day');
  let counter = 0;
  while (daysLeft >= 0) {
    const day = moment(date).subtract(daysLeft, 'days');
    const dayIterations = reduceIterationToDay(iterations, day);
    weekDaysWithMilis[weekdays[counter]] = dayIterations.reduce(
      (total, iteration) => total + getmilis(iteration),
      0
    );
    daysLeft--;
    counter++;
  };

  const week = {};
  let remaining = 0;
  const hour = 60 * 60 * 1000;
  for (let i = 0; i < 7; i++) {
    const dayname = weekdays[i];
    if (remaining > 0 || weekDaysWithMilis[dayname] !== 0) {
      week[dayname] = weekDaysWithMilis[dayname] + remaining;
      const nextRemaining = week[dayname] % hour;
      week[dayname] = Math.floor(week[dayname] / hour);
      remaining = nextRemaining;
    } else {
      week[dayname] = 0;
    }
  }

  return [week, daysnumber];
}

module.exports = {
  addAccount, getUsers, closeConnection,
  addIteration, getDaySeconds, deleteUser,
  getWeekSeconds, changePassword, getWeekStats,
  connect
};
