const mongoose = require('mongoose');
const accountSchema = require('./schemas/account');

const Account = mongoose.model('Account', accountSchema);

async function addIteration(username, iteration) {
  const user = await Account.findOne({ username });
  user.iterations.push(iteration);
  await user.save();
};

exports.addIteration = addIteration;
