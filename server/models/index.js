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
  mongoose.connect(process.env.STR_DB_CON);
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
    const IsInThisWeek = function ({ start, end }) {
      return isPointOf('week', start, end, m);
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
  const [ { iterations } ] = await Account.aggregate([
    { $match: { username } },
    {
      $project: {
        _id: 0,
        iterations: {
          $filter: {
            input: "$iterations",
            as: "iteration",
            cond: {
              $eq: [
                { $week: moment(date).toDate() },
                { $week: "$$iteration.start" }
              ]
            }
          }
        }
      }
    },
    { $project: { iterations: { _id: 0 } } }
  ]);

  const getmilis = (iter) => (new Date(iter.end).getTime()) - (new Date(iter.start).getTime());
  const weekDaysWithMilis = iterations.reduce(function (prev, iter) {
    const day = moment(iter.start).format('dddd').toLowerCase();
    prev[day] += getmilis(iter);
    return prev;
  }, {
    sunday: 0, monday: 0, tuesday: 0, wednesday: 0,
    thursday: 0, friday: 0, saturday: 0 })
  ;
  const days = Object.keys(weekDaysWithMilis);
  const week = {};
  let remaining = 0;
  const hour = 60 * 60 * 1000;
  for (let i = 0; i < 7; i++) {
    const dayname = days[i];
    if (remaining > 0 || weekDaysWithMilis[dayname] !== 0) {
      week[dayname] = weekDaysWithMilis[dayname] + remaining;
      const nextRemaining = week[dayname] % hour;
      week[dayname] = Math.floor(week[dayname] / hour);
      remaining = nextRemaining;
    } else {
      week[dayname] = 0;
    }
  }

  const numberdays = [];
  let relativeday = moment(date).startOf('week');
  while (numberdays.length < 7) {
    numberdays.push(relativeday.date());
    relativeday = relativeday.add(1, 'day');
  }
  return [ week, numberdays];
}

module.exports = {
  addAccount, getUsers, closeConnection,
  addIteration, getDaySeconds, deleteUser,
  getWeekSeconds, changePassword, getWeekStats,
  connect
};
