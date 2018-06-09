const validator = require('validator');
const isEmpty = require('./is-empty');
const debug = require('debug')('server: experience');

module.exports = function validateExperienceInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.company = !isEmpty(data.company) ? data.company : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if(validator.isEmpty(data.title)) {
    errors.title = 'Title is required';
  }


  if(validator.isEmpty(data.company)) {
    errors.company = 'company is required';
    debug('errors\t', errors.company);
  }


  if(validator.isEmpty(data.from)) {
      errors.from = 'Start date is required';
  }

  debug('data\t', data.company)

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
