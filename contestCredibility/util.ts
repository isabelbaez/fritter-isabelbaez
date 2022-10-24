import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {ContestCredibility} from '../contestCredibility/model';

type ContestResponse = {
  _id: string;
  parentId: string;
  delta: number;
  inFavor: boolean;
  sources: Array<string>;
};

/**
 * Transform a raw FreetCredibilityScore object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<ContestCredibility>} score - A contest credibility score
 * @returns {ContestResponse} - The contest object formatted for the frontend
 */
const constructContestResponse = (score: HydratedDocument<ContestCredibility>): ContestResponse => {
  
  const scoreCopy: ContestCredibility = {
    ...score.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...scoreCopy,
    _id: scoreCopy._id.toString(),
    parentId: scoreCopy.parentId.toString(),
    inFavor: scoreCopy.inFavor,
    sources: scoreCopy.sources,
    delta: scoreCopy.delta,
  };
};

export {
  constructContestResponse
};
