const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : '';

  if(!validator.isLength(data.text, {min: 3, max: 240})) {
    errors.text = 'Comment must be between 3 and 240 characters';
  }
  if(validator.isEmpty(data.text)) {
    errors.text = 'Text is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
