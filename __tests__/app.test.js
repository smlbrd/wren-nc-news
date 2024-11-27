const endpointsJson = require('../endpoints.json');
const request = require('supertest');
const app = require('../db/app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe('GET /api', () => {
  test('200: Responds with an object detailing the documentation for each endpoint', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe('GET /api/topics', () => {
  test('200: Responds with an array of topic objects containing slug and description properties', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe('GET /api/articles', () => {
  test('200: Responds with an array of article objects containing correct properties', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(5);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test('200: Responds with an array sorted by created_at, default descending order, containing no body property', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy('created_at', { descending: true });
        expect(articles.length).toBe(5);
        articles.forEach((article) => {
          expect(article).not.toHaveProperty('body');
        });
      });
  });
});

describe('GET /api/articles?sort_by', () => {
  test('200: Responds with an array sorted by article_id, default descending order', () => {
    return request(app)
      .get('/api/articles?sort_by=article_id')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(5);
        expect(articles).toBeSortedBy('article_id', { descending: true });
      });
  });
  test('200: Responds with an array sorted by title, default descending order', () => {
    return request(app)
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(5);
        expect(articles).toBeSortedBy('title', { descending: true });
      });
  });
  test('200: Responds with an array sorted by comment_count, default descending order', () => {
    return request(app)
      .get('/api/articles?sort_by=comment_count')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(5);
        expect(articles).toBeSortedBy('comment_count', {
          descending: true,
          coerce: true,
        });
      });
  });
  test('400: Responds with an error message if invalid sort_by query', () => {
    return request(app)
      .get('/api/articles?sort_by=mouthfeel')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });
});

describe('GET /api/articles?order', () => {
  test('200: Responds with an array sorted in ascending order, default sort_by query (created_at)', () => {
    return request(app)
      .get('/api/articles?order=ASC')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(5);
        expect(articles).toBeSortedBy('created_at', { ascending: true });
      });
  });
  test('200: Responds with an array sorted in ascending order, custom (valid) sort_by query', () => {
    return request(app)
      .get('/api/articles?sort_by=article_id&order=ASC')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(5);
        expect(articles).toBeSortedBy('article_id', { ascending: true });
      });
  });
  test('400: Responds with an error message if invalid order query', () => {
    return request(app)
      .get('/api/articles?order=shuffle')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });
});

describe('GET /api/articles?topic', () => {
  test('200: Responds with an array of articles matching topic query', () => {
    return request(app)
      .get('/api/articles?topic=mitch')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(4);
        articles.forEach((article) => {
          expect(article.topic).toBe('mitch');
        });
      });
  });
  test('200: Responds with an empty array if topic exists, but no articles match topic query', () => {
    return request(app)
      .get('/api/articles?topic=paper')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(0);
      });
  });
  test('200: Responds with an array of all articles if query is omitted', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(5);
      });
  });
  test("404: Responds with an error message if topic doesn't exist", () => {
    return request(app)
      .get('/api/articles?topic=frogs')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
  });
});

describe('GET /api/articles/:article_id', () => {
  test('200: Responds with the article linked to :article_id', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual({
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: '2020-07-09T20:11:00.000Z',
          votes: 100,
          article_img_url:
            'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        });
      });
  });
  test('400: Responds with an error message if article_id is not a number', () => {
    return request(app)
      .get('/api/articles/soup')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(`Bad Request`);
      });
  });
  test('404: Responds with an error message if article_id does not exist', () => {
    return request(app)
      .get('/api/articles/99999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe(`Not Found`);
      });
  });
});

describe('PATCH /api/articles/:article_id', () => {
  test('200: Responds with article including updated vote count for given article_id', () => {
    const testBody = {
      inc_votes: 1,
    };

    return request(app)
      .patch('/api/articles/2')
      .send(testBody)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(2);
        expect(article.votes).toBe(1);
      });
  });
  test('200: Responds with article including updated vote count, value can be negative', () => {
    const testBody = {
      inc_votes: -100,
    };

    return request(app)
      .patch('/api/articles/3')
      .send(testBody)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(3);
        expect(article.votes).toBe(-100);
      });
  });
  test('400: Responds with an error message if article_id is NaN', () => {
    const testBody = {
      inc_votes: 2,
    };

    return request(app)
      .patch(
        '/api/articles/lo-cost-scalding-hot-soups-to-burn-mouth-and-taste-nothing-to'
      )
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });
  test('400: Responds with an error message if request is empty object', () => {
    const testBody = {};

    return request(app)
      .patch('/api/articles/3')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });
  test('400: Responds with an error message if request key is not inc_votes', () => {
    const testBody = {
      "that_key_ain't_right": 1,
    };

    return request(app)
      .patch('/api/articles/4')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });
  test('400: Responds with an error message if request value is NaN', () => {
    const testBody = {
      inc_votes: 'one-hundred-thousand',
    };

    return request(app)
      .patch('/api/articles/5')
      .send(testBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });
  test("404: Responds with an error message is article_id doesn't exist", () => {
    const testBody = {
      inc_votes: 10,
    };

    return request(app)
      .patch('/api/articles/99999')
      .send(testBody)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
  });
});

describe('GET /api/articles/:article_id/comments', () => {
  test('200: Responds with all comments for a given article_id, containing correct properties', () => {
    return request(app)
      .get('/api/articles/3/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(2);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 3,
          });
        });
      });
  });
  test('200: Responds with comments ordered by most recent', () => {
    return request(app)
      .get('/api/articles/5/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy('created_at', { descending: true });
      });
  });
  test('200: Responds with an empty array if article_id exists, but has no comments', () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  test('400: Responds with an error message if article_id is not a number', () => {
    return request(app)
      .get('/api/articles/doctors-hate-this-one-weird-trick/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(`Bad Request`);
      });
  });
  test('404: Responds with an error message if article_id does not exist', () => {
    return request(app)
      .get('/api/articles/99999/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe(`Not Found`);
      });
  });
});

describe('POST /api/articles/:article_id/comments', () => {
  test('201: Responds with a new comment created at a given article_id', () => {
    const testComment = {
      username: 'butter_bridge',
      body: "when are y'all gonna start posting recipes on this site?",
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(testComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          article_id: 1,
          author: 'butter_bridge',
          body: "when are y'all gonna start posting recipes on this site?",
          comment_id: 19,
          created_at: expect.any(String),
          votes: 0,
        });
      });
  });
  test('400: Responds with an error message if article_id is NaN', () => {
    const testComment = {
      username: 'lurker',
      body: "i don't normally do this sort of thing",
    };

    return request(app)
      .post('/api/articles/scrambled-egg/comments')
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });
  test('404: Responds with an error message if username does not exist in users table', () => {
    const testComment = {
      username: 'broth-baby',
      body: 'i like soup',
    };

    return request(app)
      .post('/api/articles/3/comments')
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
  });
  test('404: Responds with an error message if body missing from request', () => {
    const testComment = {};

    return request(app)
      .post('/api/articles/5/comments')
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
  });
  test('404: Responds with an error message if username missing from request', () => {
    const testComment = {
      body: "post this anywhere I don't mind",
    };

    return request(app)
      .post('/api/articles/4/comments')
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
  });
  test("404: Responds with an error message if article_id doesn't exist", () => {
    const testComment = {
      username: 'lurker',
      body: 'posting is my new passion',
    };

    return request(app)
      .post('/api/articles/99999/comments')
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
  });
});

describe('DELETE /api/comments/comment_id', () => {
  test('204: Responds with status code after deleting given comment_id from table', () => {
    return request(app).delete('/api/comments/2').expect(204);
  });
  test('400: Responds with an error message if comment_id is NaN', () => {
    return request(app)
      .delete('/api/comments/begone-comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });
  test("404: Responds with an error message if comment_id doesn't exist", () => {
    return request(app)
      .delete('/api/comments/99999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
  });
});

describe('GET /api/users', () => {
  test('200: Responds with an array of users containing correct properties', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe('404: Non-existent route query', () => {
  test('404: Request to non-existent route', () => {
    return request(app)
      .get('/api/grandma_s_perfect_autumn_strudel_recipe')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe(`Not Found`);
      });
  });
});
