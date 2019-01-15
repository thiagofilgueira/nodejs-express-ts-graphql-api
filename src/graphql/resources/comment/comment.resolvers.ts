import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { CommentInstance } from "../../../models/CommentModel";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { RequestedFields } from "../../ast/RequestedFields";

export const commentResolvers = {

    Comment: {

        user: (comment, params, {db, dataloaders: {userLoader}}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
            return userLoader
                .load({key: comment.get('user'), info})
                .catch(handleError);
            /*return db.User
                .findById(comment.get('user'))
                .catch(handleError);*/
        },

        post: (comment, params, {db, dataloaders: {postLoader}}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
            return postLoader
                .load({key: comment.get('user'), info})
                .catch(handleError);
            /*return db.Post
                .findById(comment.get('post'))
                .catch(handleError);*/
        }

    },

    Query: {

        commentsByPost: (parent, {postId, first = 10, offset = 0}, {db, requestedFields}: {db: DbConnection, requestedFields: RequestedFields}, info: GraphQLResolveInfo) => {
            postId = parseInt(postId);
            return db.Comment
                .findAll({
                    where: { post: postId},
                    limit: first,
                    offset: offset,
                    attributes: requestedFields.getFields(info)
                })
                .catch(handleError);
        }

    },

    Mutation: {

        createComment: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            input.user = authUser.id;
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, {transaction: t});
            }).catch(handleError);
        }),

        updateComment: compose(...authResolvers)((parent, {id, input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                id = parseInt(id);
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment with id ${id} not found!`);
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit comments by yourself!`);
                        input.user = authUser.id;
                        return comment.update(input, {transaction: t});
                    });
            }).catch(handleError);
        }),

        deleteComment: compose(...authResolvers)((parent, {id}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                id = parseInt(id);
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment with id ${id} not found!`);
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only delete comments by yourself!`);
                        return comment.destroy({transaction: t})
                        // .then((comment) => !!comment);
                            .then(() => true)
                            .catch(() => false);
                    });
            }).catch(handleError);
        })

    }

};