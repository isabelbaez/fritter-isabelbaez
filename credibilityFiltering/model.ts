import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type CredibilityFiltering = {
  _id: Types.ObjectId;
  feedId: Types.ObjectId;
  unscoredFreets: boolean;
  highScoredFreets: boolean;
  lowScoredFreets: boolean;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Freets stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const CredibilityFilteringSchema = new Schema<CredibilityFiltering>({
  feedId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Feed'
  },
  unscoredFreets: {
    // Use Types.ObjectId outside of the schema
    type: Boolean,
    default: true
  },
  highScoredFreets: {
    // Use Types.ObjectId outside of the schema
    type: Boolean,
    default: true
  },
  lowScoredFreets: {
    // Use Types.ObjectId outside of the schema
    type: Boolean,
    default: true
  },
});

const CredibilityFilteringModel = model<CredibilityFiltering>('CredibilityFiltering', CredibilityFilteringSchema);
export default CredibilityFilteringModel;
