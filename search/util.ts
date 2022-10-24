import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Types} from 'mongoose';
import type {Search} from '../search/model';
import type {Freet} from '../freet/model';
import { User } from 'user/model';

// Update this if you add a property to the Freet type!
type SearchResponse = {
  _id: string;
  viewerId: string;
  content: string;
  users: Array<string>;
};

/**
 * Transform a raw Freet object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Search>} search - A search
 * @returns {SearchResponse} - The search object formatted for the frontend
 */
const constructSearchResponse = (search: HydratedDocument<Search>): SearchResponse => {
  const searchCopy: Search = {
    ...search.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...searchCopy,
    _id: searchCopy._id.toString(),
    viewerId: searchCopy.viewerId.toString(),
    content: searchCopy.content,
    users: searchCopy.users
  };
};

export {
  constructSearchResponse
};
