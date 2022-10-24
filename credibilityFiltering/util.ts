import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {CredibilityFiltering} from '../credibilityFiltering/model';

type FilterResponse = {
  _id: string;
  feedId: string;
  unscoredFreets: boolean;
  highScoredFreets: boolean;
  lowScoredFreets: boolean;
};

/**
 * Transform a raw CredibilityFiltering object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<CredibilityFiltering>} filter - A credibility filter
 * @returns {FilterResponse} - The filter object formatted for the frontend
 */
const constructFilterResponse = (filter: HydratedDocument<CredibilityFiltering>): FilterResponse => {
  
  const filterCopy: CredibilityFiltering = {
    ...filter.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...filterCopy,
    _id: filterCopy._id.toString(),
    feedId: filterCopy.feedId.toString(),
    unscoredFreets: filterCopy.unscoredFreets,
    highScoredFreets: filterCopy.highScoredFreets,
    lowScoredFreets: filterCopy.lowScoredFreets,
  };
};

export {
  constructFilterResponse
};
