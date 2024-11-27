const { checkExists } = require('../db/seeds/utils');
const {
  fetchCommentsByArticleId,
  addCommentByArticleId,
  removeCommentById,
} = require('../models/comments.models');

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const promiseArr = [fetchCommentsByArticleId(article_id)];

  if (article_id) {
    promiseArr.push(checkExists('articles', 'article_id', article_id));
  }

  Promise.all(promiseArr)
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  const promiseArr = [checkExists('articles', 'article_id', article_id), addCommentByArticleId(article_id, username, body)]
  
  if (username) {
    promiseArr.push(checkExists('users', 'username', username));
  }

  Promise.all(promiseArr)
    .then(([_, comment]) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  return checkExists('comments', 'comment_id', comment_id)
    .then(() => {
      return removeCommentById(comment_id);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
