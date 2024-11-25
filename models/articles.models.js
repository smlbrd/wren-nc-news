const db = require('../db/connection');

exports.fetchArticleById = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({
      status: 400,
      msg: `Article ID must be a number.`,
    });
  }

  const queryString = `SELECT * FROM articles 
    WHERE article_id = $1`;

  return db.query(queryString, [article_id]).then(({ rows }) => {
    return rows[0];
  });
};
