process.env.NODE_ENV = "test";
const app = require('../server')
const supertest  = require('supertest')
const connection = require('../db');
const request = supertest(app)
const shortid = require('shortid');

beforeAll(async () => {
  await connection.query(
    "CREATE TABLE url_shortner (id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,\
    full VARCHAR(255) NOT NULL,\
    short VARCHAR(50) NOT NULL)"
  );
});

beforeEach(async () => {
  await connection.query("INSERT INTO url_shortner SET full='https://www.icarusinnovations.co', short = '9_wwCCAd' ");
  await connection.query("INSERT INTO url_shortner SET full='https://www.google.com', short = 'Avdc_7' ");
});


afterEach(async () => {
  await connection.query("DELETE FROM url_shortner");
});

afterAll(async () => {
  await connection.query("DROP TABLE url_shortner");
  await connection.end();
})

describe("GET /api/geturls", () => {
    test("It responds with an array of urls", async () => {
      const response = await request.get("/api/geturls");
      expect(response.body.success.length).toBe(2);
      expect(response.body.success).toContainEqual(
        expect.objectContaining({ full: expect.any(String), short: expect.any(String)})
      )
      expect(response.statusCode).toBe(200);
    });
});

describe("GET /api/checkUrlShortCount", () => {
  test("gets the total time a url is shortend for https://www.icarusinnovations.co", async () => {
    const response = await request.get("/api/checkUrlShortCount?url=https://www.icarusinnovations.co");
    expect(response.body).toStrictEqual({ count: 1})
    expect(response.statusCode).toBe(200);
  });

  test("gives count 0 if no url specified", async () => {
    const response = await request.get("/api/checkUrlShortCount");
    expect(response.body).toStrictEqual({ count: 0})
    expect(response.statusCode).toBe(200);
  });
});


describe("GET /:shortUrl", () => {
  
test("Redirect to full url taking short url parameter", async () => {
    const response = await request.get("/Avdc_7")
    expect(response.header['location']).toBe('https://www.google.com')
  });

})


describe("POST /api/shortUrls", () => {
    
  test("It responds with the newly created short Url", async () => {
      const response = await request
        .post("/api/shortUrls")
        .send({
          full: "https://www.icarusinnovations.co"
        });
        
      expect(response.body.success).toStrictEqual({ full: expect.any(String), short: expect.any(String)})
      expect(response.statusCode).toBe(200);


      // make sure we have 3 urls now
      const response2 = await request.get("/api/geturls");
      expect(response2.body.success.length).toBe(3);
    });
  })