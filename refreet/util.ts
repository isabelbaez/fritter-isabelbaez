import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Refreet} from '../refreet/model';

// Update this if you add a property to the Freet type!
type RefreetResponse = {
  _id: string;
  userId: string;
  parentId: string;
  dateCreated: string;
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
 * @param {HydratedDocument<Refreet>} refreet - A refreet
 * @returns {RefreetResponse} - The refreet object formatted for the frontend
 */
const constructRefreetResponse = (refreet: HydratedDocument<Refreet>): RefreetResponse => {
  
  const refreetCopy: Refreet = {
    ...refreet.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...refreetCopy,
    _id: refreetCopy._id.toString(),
    userId: refreetCopy.userId.toString(),
    parentId: refreetCopy.parentId.toString(),
    dateCreated: formatDate(refreet.dateCreated),
  };
};

export {
  constructRefreetResponse
};
