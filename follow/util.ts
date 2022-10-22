import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Types} from 'mongoose';
import { User } from 'user/model';
import { Follow } from './model';

// Update this if you add a property to the Freet type!
type FollowResponse = {
  _id: string;
  srcUserId: string;
  dstUserId: string;
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
 * @param {HydratedDocument<Freet>} freet - A freet
 * @returns {FreetResponse} - The freet object formatted for the frontend
 */
const constructFollowResponse = (follow: HydratedDocument<Follow>): FollowResponse => {
  const followCopy: Follow = {
    ...follow.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  return {
    ...followCopy,
    _id: followCopy._id.toString(),
    srcUserId: followCopy.srcUserId.toString(),
    dstUserId: followCopy.dstUserId.toString(),
    dateCreated: formatDate(follow.dateCreated),
  };
};

export {
  constructFollowResponse
};
