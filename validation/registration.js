const validator = require('validator');
const isEmpty = require('./is-empty');
const debug = require('debug')('server:registration');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  if(!validator.isLength(data.name,
  {
    min: 2,
    max: 30
  })){
    errors.name = 'Name must be between 2 and 30 characters';
  }

  if(validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  if(validator.isEmpty(data.email)) {
    errors.email = 'Email is required';
  }

  if(!validator.isEmail(data.email)) {
    errors.email = 'Invalid email';
    debug('sdf',errors.email);
  }

  if (validator.isEmpty(data.password)) {
    errors.password = 'Password is required';
    debug(errors.password);
  }

  if(!validator.isLength(data.password, {min: 8, max: 30})) {
    errors.password = 'Password must be between 8 and 30 characters';
  }

  if(validator.isEmpty(data.password2)) {
    errors.password2 = 'Confirm Password';
  }

  if(!validator.equals(data.password, data.password2)) {
    errors.password2 = 'Passwords must match';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
