import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {FreetCredibilityScore} from '../freetCredibilityScore/model';

type ScoreResponse = {
  _id: string;
  parentId: string;
  value: number;
  sources: Array<string>;
};

/**
 * Transform a raw FreetCredibilityScore object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<FreetCredibilityScore>} score - A freet credibility score
 * @returns {ScoreResponse} - The score object formatted for the frontend
 */
const constructScoreResponse = (score: HydratedDocument<FreetCredibilityScore>): ScoreResponse => {
  
  const scoreCopy: FreetCredibilityScore = {
    ...score.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...scoreCopy,
    _id: scoreCopy._id.toString(),
    parentId: scoreCopy.parentId.toString(),
    value: scoreCopy.value,
    sources: scoreCopy.sources,
  };
};

export {
  constructScoreResponse
};
