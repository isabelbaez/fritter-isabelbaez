import FreetCredibilityScoreCollection from '../freetCredibilityScore/collection';
import type {HydratedDocument, Types} from 'mongoose';
import type {ContestCredibility} from './model';
import ContestCredibilityeModel from './model';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class ContestCredibilityCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} freetId - The id of the freet which's score is being contested
   * @param {string} inFavor - Boolean determining if the score should be higher
   * @param {string} sources - List of sources to redetermine the score 
   * @return {Promise<HydratedDocument<ContestCredibility>>} - The newly created score
   */
  static async addOne(freetId: Types.ObjectId | string, inFavor: boolean, sources: Array<string>): Promise<HydratedDocument<ContestCredibility>> {

    const parentScore = await FreetCredibilityScoreCollection.findOneByParent(freetId);

    const parentId = parentScore._id;

    let delta: number = Math.min((sources.length*4)/5.0,5.0);

    if (!inFavor) {
      delta *= -1;
    }

    const contest = new ContestCredibilityeModel({
      parentId,
      inFavor,
      sources, 
      delta,
    });

    await FreetCredibilityScoreCollection.updateScore(parentId._id,delta);

    await contest.save(); // Saves freet to MongoDB
    // set state for Freet
    return contest;
  }

  /**
   * Find a score by scoreId
   *
   * @param {string} contestId - The id of the score to find
   * @return {Promise<HydratedDocument<Like>> | Promise<null> } - The score with the given scoreId, if any
   */
  static async findOne(contestId: Types.ObjectId | string): Promise<HydratedDocument<ContestCredibility>> {
    return ContestCredibilityeModel.findOne({_id: contestId});
  }

  /**
   * Get all the scores in the database
   *
   * @return {Promise<HydratedDocument<FreetCredibilityScore>[]>} - An array of all of the scores
   */
  static async findAll(): Promise<Array<HydratedDocument<ContestCredibility>>> {
    return ContestCredibilityeModel.find({}).sort({dateCreated: -1});
  }

  /**
   * Get all the contests in by given author
   *
   * @param {string} parentId - The id of the parent score of the contests
   * @return {Promise<HydratedDocument<Like>[]>} - An array of all of the contests with that score as aprent
   */
  static async findAllByParent (parentId: Types.ObjectId | string): Promise<Array<HydratedDocument<ContestCredibility>>> {
    return ContestCredibilityeModel.find({parentId: parentId});
  }

  /**
   * Delete a score with given scoreId.
   *
   * @param {string} scoreId - The scoreId of score to delete
   * @return {Promise<Boolean>} - true if the score has been deleted, false otherwise
   */
  static async deleteOne(scoreId: Types.ObjectId | string): Promise<boolean> {
    const delScore = await ContestCredibilityeModel.deleteOne({_id: scoreId});
    
    return delScore !== null;
  }
}

export default ContestCredibilityCollection;
