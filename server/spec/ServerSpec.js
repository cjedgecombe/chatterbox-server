var handler = require('../request-handler');
var expect = require('chai').expect;
var stubs = require('./Stubs');

describe('Node Server Request Listener Function', function() {
  it('Should answer GET requests for /classes/messages with a 200 status code', function() {
    // This is a fake server request. Normally, the server would provide this,
    // but we want to test our function's behavior totally independent of the server code
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
  });

  it('Should send back parsable stringified JSON', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(JSON.parse.bind(this, res._data)).to.not.throw();
    expect(res._ended).to.equal(true);
  });

  it('Should send back an array', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.be.an('array');
    expect(res._ended).to.equal(true);
  });

  it('Should accept posts to /classes/messages', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Expect 201 Created response status
    expect(res._responseCode).to.equal(201);

    // Testing for a newline isn't a valid test
    // TODO: Replace with with a valid test
    expect(res._data).to.equal(JSON.stringify(undefined));
    expect(res._ended).to.equal(true);
  });

  it('Should respond with messages that were previously posted', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(201);

    // Now if we request the log for that room the message we posted should be there:
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    var messages = JSON.parse(res._data);
    expect(messages.length).to.be.above(0);
    expect(messages[0].username).to.equal('Jono');
    expect(messages[0].text).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });

  it('Should 404 when asked for a nonexistent file', function() {
    var req = new stubs.request('/arglebargle', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(404);
    expect(res._ended).to.equal(true);
  });

  it('Should expect status code of 400 when given an array or other non objects', function() {
    var stubMsg = ['Jono', 'Do my bidding'];
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();
    handler.requestHandler(req, res);
    expect(res._responseCode).to.equal(400);

    var stubMsg = true;
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();
    handler.requestHandler(req, res);
    expect(res._responseCode).to.equal(400);
  });

  it('Should return as many messages that were posted', function() {
    var stubMsg = {
      username: 'CJ',
      text: 'Hi CJ'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();
    handler.requestHandler(req, res);

    var stubMsg = {
      username: 'Kevin',
      text: 'Hi Kevin'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();
    handler.requestHandler(req, res);

    // GET
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    var messages = JSON.parse(res._data);
    // Expect there to be 4 total messages to account for
    // POST in other tests above
    expect(messages.length).to.equal(4);
  });

  it('Should return 418 error if asked to brew coffee in the text', function() {
    var stubMsg = {
      username: 'CJ',
      text: `I DRINK BREW COFFEE FOR DINNER WITH MY MOM`
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();
    handler.requestHandler(req, res);
    expect(res._responseCode).to.equal(418);
  });


});
