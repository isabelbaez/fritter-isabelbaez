import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Types} from 'mongoose';
import type {Freet} from '../freet/model';
import { User } from 'user/model';

// Update this if you add a property to the Freet type!
type FreetResponse = {
  _id: string;
  authorId: string;
  dateCreated: string;
  content: string;
  likes: Array<string>;
  refreets: Array<string>;
  credibilityScoreId: string;
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
 * @param {HydratedDocument<Freet>} freet - A freet
 * @returns {FreetResponse} - The freet object formatted for the frontend
 */
const constructFreetResponse = (freet: HydratedDocument<Freet>): FreetResponse => {
  const freetCopy: Freet = {
    ...freet.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  let credScore: string;

  if (!freetCopy.credibilityScoreId) {
    credScore = "Disabled";
  } else {
    credScore = freetCopy.credibilityScoreId.toString();
  }

  return {
    ...freetCopy,
    _id: freetCopy._id.toString(),
    authorId: freetCopy.authorId.toString(),
    dateCreated: formatDate(freet.dateCreated),
    likes: freetCopy.likes,
    refreets: freetCopy.refreets,
    credibilityScoreId: credScore
  };
};

export {
  constructFreetResponse
};
