import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Like} from '../like/model';

// Update this if you add a property to the Freet type!
type LikeResponse = {
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
 * @param {HydratedDocument<Like>} like - A freet
 * @returns {LikeResponse} - The freet object formatted for the frontend
 */
const constructLikeResponse = (like: HydratedDocument<Like>): LikeResponse => {
  const likeCopy: Like = {
    ...like.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...likeCopy,
    _id: likeCopy._id.toString(),
    userId: likeCopy.userId.toString(),
    parentId: likeCopy.userId.toString(),
    dateCreated: formatDate(like.dateCreated),
  };
};

export {
  constructLikeResponse
};
