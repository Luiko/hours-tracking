const mongoose = require('mongoose');
const accountSchema = require('./account');
const Bcrypt = require('bcrypt');
const moment = require('moment');
require('dotenv').config();

const db = mongoose.connection;
db.on('error', () => console.error('connection error'));
db.once('open', function () {
  console.log('mongoose connection');
});

const Account = mongoose.model('Account', accountSchema);
mongoose.connect(process.env.STR_DB_CON);

exports.addAccount = async function (email, username, password) {
  const hash = await Bcrypt.hash(password.toString(), 14);
  const account = new Account({ username, email, password: hash });
  const process = await account.save();
  process.log();
};

exports.getUsers = async function () {
  const users = await Account.find({}, { _id: 0, __v: 0 });
  return users.reduce(function (prev, curr) {
    prev[curr.username] = curr;
    return prev;
  }, {});
};

exports.closeConnection = function () {
  mongoose.connection.close();
};

exports.addIteration = function (username, iteration) {
  return new Promise(function (resolve, reject) {
    Account.findOne({ username }, function (err, user) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      if (user) {
        user.iterations.push(iteration);
        resolve(user.save());
      } else {
        reject({ message: `${username} not found`, statusCode: 404 });
      }
    });
  });
};

exports.getDaySeconds = function (username, day) {
  return new Promise(function (resolve, reject) {
    Account.findOne({ username }, function (err, account) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const dayIterations = reduceIterationToDay(account.iterations, day);
      const secondsDay = getDaySeconds(dayIterations, day);
      resolve(secondsDay);
    });
  });
};
function reduceIterationToDay(iterations, date = new Date()) {
  return iterations.filter(function ({ start, end }) {
    return isOfThisDay(start, end, date);
  });
}
function isOfThisDay(start, end, date) {
  return moment(start).isSame(date, 'day') ||
    moment(end).isSame(date, 'day');
};
function getDaySeconds(iterations, date) {
  const seconds = (prev, start, end) => prev + moment(end).diff(start, 's');
  return iterations.reduce(function (prev, { start, end }) {
    const monthDay = moment(date).date();
    if (moment(start).date() < monthDay) {
      return seconds(prev, moment(date).startOf('day'), end);
    } else if (moment(end).date() > monthDay) {
      return seconds(prev, start, moment(date).endOf('day'));
    }
    return seconds(prev, start, end);
  }, 0);
}

exports.getHoursDay = async function (username, day) {
  const secondsDay = await exports.getDaySeconds(username, day);
  return Math.floor(secondsDay / (60 * 60));
};

exports.deleteUser = function (username) {
  return new Promise(function (resolve, reject) {
    Account.deleteOne({ username }, function (err) {
      if (err) {
        console.log(err.message);
        reject(err);
        return;
      }
      resolve();
    });
  });
};

exports.getWeekSeconds = function (username) {
  return new Promise(function (resolve, reject) {
    Account.findOne({ username }, function (err, user) {
      if (err) {
        console.log(err.message);
        reject(err);
        return;
      }
      const weekIterations = user.iterations.filter(iterationToWeek);

      const m = moment();
      const weekSeconds = weekIterations.reduce(iterationsToWeekSeconds, 0);
      resolve(weekSeconds);

      function iterationToWeek({ start, end }) {
        const isSame = moment().isSame.bind(moment());
        return isSame(start, 'day') || isSame(end, 'week');
      }

      const weekStart = m.startOf('week');
      const weekEnd = m.endOf('week');

      function iterationsToWeekSeconds(prev, { start, end }) {
        const _start = moment(start).isSame(m, 'week')? start: weekStart;
        const _end = moment(end).isSame(m, 'week')? end: weekEnd;
        return prev + (moment(_end).diff(_start, 'seconds'));
      }
    });
  });
};
