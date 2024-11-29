const articlesRouter = require('express').Router();

const {
  getArticles,
  postArticle,
  getArticleById,
  patchArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  deleteArticleById,
} = require('../controllers/articles.controllers');

articlesRouter.route('/').get(getArticles).post(postArticle);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(deleteArticleById);

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

module.exports = articlesRouter;
