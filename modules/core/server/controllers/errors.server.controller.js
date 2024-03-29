'use strict';

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
  var output;

  try {
    var fieldName = err.errmsg.substring(err.errmsg.lastIndexOf('.$') + 2, err.errmsg.lastIndexOf('_1'));
    output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

  } catch (ex) {
    output = 'Unique field already exists';
  }

  return output;
};

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
  var message = '';
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = getUniqueErrorMessage(err);
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    console.log(err);
    if(!err.errors) {
      message = 'Something went wrong';
    }
    else {
      for (let i = 0;i < err.errors.length;i++) {
        if (err.errors[i].message) {
          message = err.errors[i].message;
        }
      }
    }
  }

  return message;
};