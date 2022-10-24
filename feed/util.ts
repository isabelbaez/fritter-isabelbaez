import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Types} from 'mongoose';
import type {Feed} from '../feed/model';
import type {Freet} from '../freet/model';
import { User } from 'user/model';

// Update this if you add a property to the Freet type!
type FeedResponse = {
  _id: string;
  viewerId: string;
  freets: Array<string>;
};

/**
 * Transform a raw Freet object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Freet>} freet - A freet
 * @returns {FreetResponse} - The freet object formatted for the frontend
 */
const constructFeedResponse = (feed: HydratedDocument<Feed>): FeedResponse => {
  const feedCopy: Feed = {
    ...feed.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...feedCopy,
    _id: feedCopy._id.toString(),
    viewerId: feedCopy.viewerId.toString(),
    freets: feedCopy.freets
  };
};

export {
  constructFeedResponse
};
