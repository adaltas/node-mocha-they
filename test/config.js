const they = require('../src')({ key: 'value' });

describe('they.config', function() {
  they('immutable part 1', function(conf) {
    conf.invalid = true;
  });

  they('immutable part 2', function(conf) {
    should.not.exist(conf.invalid);
  });
});
