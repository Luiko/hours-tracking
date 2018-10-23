const morePlugins = require('./others');

if (Array.isArray(morePlugins)) {
  module.exports = [ /* publicPluginX, publicPluginY, */ ...morePlugins ];
} else {
  module.exports = [];
}
