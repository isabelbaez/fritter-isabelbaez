/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

function viewAllRefreets(fields) {
    fetch('/api/refreets')
      .then(showResponse)
      .catch(showResponse);
  }
  
function viewRefreetsByAuthor(fields) {
fetch(`/api/refreets?author=${fields.author}`)
    .then(showResponse)
    .catch(showResponse);
}

function createRefreet(fields) {
fetch('/api/refreets', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);  
}

function deleteRefreet(fields) {
fetch(`/api/refreets/${fields.parentId}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}