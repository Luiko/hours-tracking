const { Schema } = require('mongoose');

const schema = new Schema({
  start: {
    type: Date,
    require: true
  },
  end: {
    type: Date,
    require: true
  }
});

schema.methods = {};

schema.static = {};

schema.pre('save', function (next) {
  if (this.start < this.end) {
    next();
    return;
  }
  next(new Error('fail validate new iteration'));
});

module.exports = schema;
