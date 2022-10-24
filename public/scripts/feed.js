/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

  
  function viewUserFeed(fields) {
    fetch(`/api/feeds`)
      .then(showResponse)
      .catch(showResponse);
  }
  
  function refreshUserFeed(fields) {
    fetch(`/api/feeds/`, {method: 'PUT'})
      .then(showResponse)
      .catch(showResponse);
  }