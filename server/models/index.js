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
mongoose.connect(process.env.STR_DB_CON);

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

module.exports = {
  addAccount, getUsers, closeConnection,
  addIteration, getDaySeconds, deleteUser,
  getWeekSeconds, changePassword
};
