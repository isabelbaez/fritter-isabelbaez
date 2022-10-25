import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Types} from 'mongoose';
import type {Freet} from '../freet/model';
import { User } from 'user/model';
import { StructuredThread } from './model';

// Update this if you add a property to the Freet type!
type ThreadResponse = {
  _id: string;
  authorId: string;
  dateCreated: string;
  content: Array<string>;
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
 * @param {HydratedDocument<StructuredThread>} thread - A thread
 * @returns {FreetResponse} - The freet object formatted for the frontend
 */
const constructThreadResponse = (thread: HydratedDocument<StructuredThread>): ThreadResponse => {
  const threadCopy: StructuredThread = {
    ...thread.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...threadCopy,
    _id: threadCopy._id.toString(),
    authorId: threadCopy.authorId.toString(),
    dateCreated: formatDate(threadCopy.dateCreated),
    content: threadCopy.content,
  };
};

export {
  constructThreadResponse
};
