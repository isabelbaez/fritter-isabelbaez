/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

 function viewAllThreads(fields) {
    fetch('/api/structuredThreads')
      .then(showResponse)
      .catch(showResponse);
  }
  
  function viewThreadsByAuthor(fields) {
    fetch(`/api/structuredThreads?author=${fields.author}`)
      .then(showResponse)
      .catch(showResponse);
  }
  
  function createThread(fields) {
    fetch('/api/structuredThreads', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
      .then(showResponse)
      .catch(showResponse);
  }
  
  function deleteThread(fields) {
    fetch(`/api/structuredThreads/${fields.id}`, {method: 'DELETE'})
      .then(showResponse)
      .catch(showResponse);
  }