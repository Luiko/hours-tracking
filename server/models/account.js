const { Schema } = require('mongoose');
const Iteration = require('./iteration');

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w\.]+@[a-z]+\.[a-z]+$/i
  },
  password: {
    type: String,
    required: true
  },
  iterations: [Iteration]
}, {
  timestamps: true
});


schema.methods = {
  log() {
    console.log(`new account ${this.username}`);
  }
};

schema.statics = {
};

module.exports = schema;
