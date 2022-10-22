/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

function viewAllFollows(fields) {
  fetch('/api/follows')
    .then(showResponse)
    .catch(showResponse);
}
  
function viewUserFollowers(fields) {
  fetch(`/api/follows?author=${fields.author}`)
    .then(showResponse)
    .catch(showResponse);
}

function viewUserFollowing(fields) {
  fetch(`/api/follows?author=${fields.author}&followers=${false}`)
    .then(showResponse)
    .catch(showResponse);
}

function viewUserFollowers(fields) {
  fetch(`/api/follows?author=${fields.author}&followers=${true}`)
    .then(showResponse)
    .catch(showResponse);
}

function createFollow(fields) {
  fetch('/api/follows', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function deleteFollow(fields) {
  fetch(`/api/follows/${fields.id}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}