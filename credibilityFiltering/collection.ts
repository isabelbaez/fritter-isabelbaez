import ContestCredibilityCollection from '../contestCredibility/collection';
import type {HydratedDocument, Types} from 'mongoose';
import type {CredibilityFiltering} from './model';
import CredibilityFilteringModel from './model';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class CredibilityFilteringCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} feedId - The id of the freet/comment being score
   * @return {Promise<HydratedDocument<CredibilityFiltering>>} - The newly created score
   */
  static async addOne(feedId: Types.ObjectId | string): Promise<HydratedDocument<CredibilityFiltering>> {

    const filter = new CredibilityFilteringModel({
      feedId
    });

    await filter.save();
    return filter;
  }

  /**
   * Find a credibility filter by filterId
   *
   * @param {string} filterId - The id of the filtering to find
   * @return {Promise<HydratedDocument<CredibilityFiltering>> | Promise<null> } - The filtering with the given filterId, if any
   */
  static async findOne(filterId: Types.ObjectId | string): Promise<HydratedDocument<CredibilityFiltering>> {
    return CredibilityFilteringModel.findOne({_id: filterId});
  }

  /**
   * Get all the filters in the database
   *
   * @return {Promise<HydratedDocument<CredibilityFiltering>[]>} - An array of all of the filters
   */
  static async findAll(): Promise<Array<HydratedDocument<CredibilityFiltering>>> {
    return CredibilityFilteringModel.find({}).sort({dateCreated: -1});
  }

  /**
   * Find a credibility filter by its parent feed
   *
   * @param {string} feedId - The id of the parent feed of the filter
   * @return {Promise<HydratedDocument<CredibilityFiltering>[]>} - The score
   */
  static async findOneByFeed (feedId: Types.ObjectId | string): Promise<HydratedDocument<CredibilityFiltering>> {
    return CredibilityFilteringModel.findOne({feedId: feedId});
  }

  /**
   * Update a filter
   *
   * @param {string} filterId - The id of the filter to update
   * @return {Promise<HydratedDocument<CredibilityFiltering>[]>} - The updated filter
   */
  static async updateFiltering (filterId: Types.ObjectId | string, unscored: boolean, highScored: boolean, lowScored: boolean,): Promise<HydratedDocument<CredibilityFiltering>> {
    
    const filter =  await CredibilityFilteringModel.findOne({_id: filterId});

    filter.unscoredFreets = unscored;
    filter.highScoredFreets = highScored;
    filter.lowScoredFreets = lowScored;

    await filter.save(); // Saves freet to MongoDB
    // set state for Freet
    return filter;
  }

  /**
   * Delete a filter with given filterId.
   *
   * @param {string} scoreId - The filterId of filter to delete
   * @return {Promise<Boolean>} - true if the filter has been deleted, false otherwise
   */
  static async deleteOne(filterId: Types.ObjectId | string): Promise<boolean> {
  
    const delFilter = await CredibilityFilteringModel.deleteOne({_id: filterId});
    return delFilter !== null;
  }
}

export default CredibilityFilteringCollection;
