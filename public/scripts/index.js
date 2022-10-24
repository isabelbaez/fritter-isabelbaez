/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// Show an object on the screen.
function showObject(obj) {
  const pre = document.getElementById('response');
  const preParent = pre.parentElement;
  pre.innerText = JSON.stringify(obj, null, 4);
  preParent.classList.add('flashing');
  setTimeout(() => {
    preParent.classList.remove('flashing');
  }, 300);
}

function showResponse(response) {
  response.json().then(data => {
    showObject({
      data,
      status: response.status,
      statusText: response.statusText
    });
  });
}

/**
 * IT IS UNLIKELY THAT YOU WILL WANT TO EDIT THE CODE ABOVE.
 * EDIT THE CODE BELOW TO SEND REQUESTS TO YOUR API.
 *
 * Native browser Fetch API documentation to fetch resources: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */

// Map form (by id) to the function that should be called on submit
const formsAndHandlers = {
  'create-user': createUser,
  'delete-user': deleteUser,
  'change-username': changeUsername,
  'change-password': changePassword,
  'contest-credibility-score': contestCredibilityScore,
  'sign-in': signIn,
  'sign-out': signOut,
  'enable-user-credibility-score': enableCredibilityScore,
  'disable-user-credibility-score': disableCredibilityScore,
  'show-feed': viewUserFeed,
  'refresh-feed': refreshUserFeed,
  'search-users': searchUsers,
  'view-all-freets': viewAllFreets,
  'view-freets-by-author': viewFreetsByAuthor,
  'create-freet': createFreet,
  'delete-freet': deleteFreet,
  'view-all-likes': viewAllLikes,
  'view-likes-by-author': viewLikesByAuthor,
  'create-like': createLike,
  'delete-like': deleteLike,
  'view-all-refreets': viewAllRefreets,
  'view-refreets-by-author': viewRefreetsByAuthor,
  'create-refreet': createRefreet,
  'delete-refreet': deleteRefreet,
  'view-all-follows': viewAllFollows,
  'view-following': viewUserFollowing,
  'view-followers': viewUserFollowers,
  'create-follow' : createFollow,
  'delete-follow' : deleteFollow,
  'view-all-comments': viewAllComments,
  'view-comments-by-author': viewCommentsByAuthor,
  'create-comment': createComment,
  'delete-comment': deleteComment,
};
// Attach handlers to forms
function init() {
  Object.entries(formsAndHandlers).forEach(([formID, handler]) => {
    const form = document.getElementById(formID);
    form.onsubmit = e => {
      e.preventDefault();
      const formData = new FormData(form);
      handler(Object.fromEntries(formData.entries()));
      return false; // Don't reload page
    };
  });
}

// Attach handlers once DOM is ready
window.onload = init;
