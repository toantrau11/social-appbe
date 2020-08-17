/**
 * VALIDATE INPUT
 */
const regEx = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const isEmpty = stringData => stringData.trim() === '';
const isEmail = email => email.match(regEx);

exports.validateLoginData = data => {
  let errors = {};
  if (isEmpty(data.email)) errors.email = 'Email must not empty';
  if (isEmpty(data.password)) errors.email = 'Password must not empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateSignUpData = data => {
  let errors = {};
  // Email validate
  if (isEmpty(data.email)) {
    errors.email = 'Email not be empty.';
  }
  if (!isEmail(data.email)) {
    errors.email = 'Must be a valid email address.';
  }

  // Password validate
  if (isEmpty(data.password)) {
    errors.password = 'Password not be empty.';
  }
  // confirm password
  if (data.password !== data.confirmPassword) {
    errors.password = 'Password not match';
  }

  // username validate
  if (isEmpty(data.handle)) {
    errors.handle = 'Handle not be empty.';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.reduceUserDetails = data => {
  let userDetail = {};
  if (!isEmpty(data.bio.trim())) userDetail.bio = data.bio;

  if (!isEmpty(data.website.trim())) {
    if (data.website.trim().substring(0, 4) !== 'http') {
      userDetail.website = `http://${data.website.trim()}`;
    } else userDetail.website = data.website;
  }

  if (!isEmpty(data.location.trim())) userDetail.location = data.location;

  return userDetail;
};
