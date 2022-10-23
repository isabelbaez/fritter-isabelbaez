import LikeModel, { Like } from '../like/model';
import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import LikeCollection from 'like/collection';

/**
 * This file defines the properties stored in a Comment
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Comment on the backend
export type Comment = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: Types.ObjectId;
  parentId: Types.ObjectId;
  dateCreated: Date;
  content: string;
  likes: Array<string>; // Add a new field called "views" with the number type to the interface
  comments: Array<string>; 
};

// Mongoose schema definition for interfacing with a MongoDB table
// Comments stored in this table will have these fields, with the
// type given by the type property, inside MongoDB

const CommentSchema = new Schema<Comment>({
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  parentId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Freet'
  },
  // The date the comment was created
  dateCreated: {
    type: Date,
    required: true
  },
  // The content of the comment
  content: {
    type: String,
    required: true
  },
  // Add likes field to the schema
  likes: {
    type: [String],
    default: new Array<string>()
  },
  // Add comments field to the schema
  comments: {
    type: [String],
    default: new Array<string>()
  },
});

const CommentModel = model<Comment>('Comment', CommentSchema);
export default CommentModel;
