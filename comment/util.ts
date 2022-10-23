import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Types} from 'mongoose';
import type {Comment} from '../comment/model';
import { User } from 'user/model';

// Update this if you add a property to the Freet type!
type CommentResponse = {
  _id: string;
  authorId: string;
  dateCreated: string;
  content: string;
  likes: Array<string>;
  comments: Array<string>;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw Freet object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Comment>} comment - A freet
 * @returns {CommentResponse} - The freet object formatted for the frontend
 */
const constructCommentResponse = (comment: HydratedDocument<Comment>): CommentResponse => {
  const commentCopy: Comment = {
    ...comment.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...commentCopy,
    _id: commentCopy._id.toString(),
    authorId: commentCopy.authorId.toString(),
    dateCreated: formatDate(comment.dateCreated),
    content: commentCopy.content,
    likes: commentCopy.likes,
    comments: commentCopy.comments
  };
};

export {
  constructCommentResponse
};
