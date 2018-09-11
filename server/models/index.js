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
  const weekDaysWithMillis = {
    'sunday': 0, 'monday': 0, 'tuesday': 0,
    'wednesday': 0, 'thursday': 0, 'friday': 0, 'saturday': 0
  };
  const weekdays = Object.keys(weekDaysWithMillis);
  let weekDaysLeft = moment(date).diff(moment(date).startOf('week'), 'day');
  let counter = 0;
  while (weekDaysLeft >= 0) {
    const day = moment(date).subtract(weekDaysLeft, 'days');
    const dayIterations = reduceIterationToDay(iterations, day);
    weekDaysWithMillis[weekdays[counter]] = dayIterations.reduce(
      (total, iteration) => total + getmilis(iteration),
      0
    );
    weekDaysLeft--;
    counter++;
  };

  const week = {};
  let remaining = 0;
  const hour = 60 * 60 * 1000;
  for (let i = 0; i < 7; i++) {
    const dayname = weekdays[i];
    if (remaining > 0 || weekDaysWithMillis[dayname] !== 0) {
      week[dayname] = weekDaysWithMillis[dayname] + remaining;
      const nextRemaining = week[dayname] % hour;
      week[dayname] = Math.floor(week[dayname] / hour);
      remaining = nextRemaining;
    } else {
      week[dayname] = 0;
    }
  }

  return [week, daysnumber];
}

async function getMonthStats(username, date) {
  const monthDays = moment(date).daysInMonth();

  const user = await Account.findOne({ username }, { iterations: 1 });
  const iterations = [...user.iterations];
  const getmilis = (iter) => (
    new Date(iter.end).getTime()) - (new Date(iter.start).getTime())
  ;
  const weekDaysWithMilliseconds = {
    'sunday': 0, 'monday': 0, 'tuesday': 0,
    'wednesday': 0, 'thursday': 0, 'friday': 0, 'saturday': 0
  };
  const month = [];
  let relativeday = moment(date).startOf('month');
  const currentMonth = moment(date).month();
  const weekStart = relativeday.week();

  while (moment(relativeday).month() === currentMonth) {
    const weekDaysWithMillis = Object.assign({}, weekDaysWithMilliseconds);
    let weekdays = Object.keys(weekDaysWithMillis);
    if (relativeday.week() === weekStart) {
      const day = relativeday.format('dddd').toLowerCase();
      weekdays = weekdays.reduce((prev, curr) => {
        if (prev.length || curr === day) {
          prev.push(curr);
        }
        return prev;
      }, []);
    } else if (moment(relativeday).add(1, 'week').month() !== currentMonth) {
      const day = moment(date).endOf('month').format('dddd').toLowerCase();
      weekdays = weekdays.reduce((prev, curr) => {
        if (prev[prev.length - 1] === day) {
          return prev;
        }
        prev.push(curr);
        return prev;
      }, []);
    }

    let weekDaysLeft = weekdays.length;
    let counter = 0;
    while (weekDaysLeft > 0) {
      const dayIterations = reduceIterationToDay(iterations, relativeday);
      weekDaysWithMillis[weekdays[counter]] = dayIterations.reduce(
        (total, iteration) => total + getmilis(iteration),
        0
      );
      weekDaysLeft--;
      counter++;
      relativeday.add(1, 'day');
    }

    const week = {};
    let remaining = 0;
    const hour = 60 * 60 * 1000;
    weekdays.forEach(dayname => {
      if (remaining > 0 || weekDaysWithMillis[dayname] !== 0) {
        week[dayname] = weekDaysWithMillis[dayname] + remaining;
        const nextRemaining = week[dayname] % hour;
        week[dayname] = Math.floor(week[dayname] / hour);
        remaining = nextRemaining;
      } else {
        week[dayname] = 0;
      }
    });
    month.push(week);
  }
  
  return [month, monthDays];
}

module.exports = {
  addAccount, getUsers, closeConnection,
  addIteration, getDaySeconds, deleteUser,
  getWeekSeconds, changePassword, getWeekStats,
  getMonthStats, connect
};
