const validator = require('validator');
const isEmpty = require('./is-empty');
const debug = require('debug')('server: experience');

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : '';
  data.degree = !isEmpty(data.degree) ? data.degree : '';
  data.location = !isEmpty(data.location) ? data.location : '';
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if(validator.isEmpty(data.school)) {
    errors.school = 'School is required';
  }

  if(validator.isEmpty(data.degree)) {
    errors.degree = 'Degree is required';
  }

  if(validator.isEmpty(data.location)) {
    errors.location = 'Location is required';
  }

  if(validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = 'Field of study is required';
  }

  if(validator.isEmpty(data.from)) {
      errors.from = 'Start date is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
