const mongoose = require('mongoose');
const accountSchema = require('./schemas/account');

const Account = mongoose.model('Account', accountSchema);

async function addIteration(username, iteration) {
  if (!iteration) {
    throw new EvalError(
      'Error on adding new iteration; iteration is not defined'
    );
  } else if (!iteration.start || !iteration.end) {
    throw new EvalError(
      'Error on adding new iteration; some iteration attributes are missing'
    );
  }
  await Account.updateOne({ username }, { $push: { iterations: iteration } });
};

async function removeLastIteration(username) {
  await Account.updateOne({ username }, { $pop: { iterations: 1 } });
}

async function countIterations(username) {
  const result = await Account.aggregate([
    { $match: { username } },
    { $unwind: "$iterations" },
    { $count: "counted" }
  ]);
  return result[0].counted;
}

module.exports = {
  addIteration, removeLastIteration, countIterations
};
