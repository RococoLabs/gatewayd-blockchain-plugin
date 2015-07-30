var RippleNameLookup, request;

request = require("superagent");

RippleNameLookup = (function() {
  function RippleNameLookup(name) {
    this.name = name;
  }

  RippleNameLookup.prototype.resolveNameToAddress = function(callback) {
    return request.get("https://id.ripple.com/v1/authinfo?username=" + this.name).end(function(error, response) {
      if (error) {
        return callback(error, null);
      } else if (response.body.exists && response.body.address) {
        return callback(null, response.body.address);
      } else {
        return callback(null, null);
      }
    });
  };

  return RippleNameLookup;

})();

module.exports = RippleNameLookup;
