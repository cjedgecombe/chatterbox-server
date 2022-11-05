/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var messagesArr = [];

var requestSubmissionTimes = [];

var requestHandler = function (request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  var defaultCorsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type, accept, authorization',
    'access-control-max-age': 10 // Seconds.
  };
  var headers = defaultCorsHeaders;
  if (request.url === '/classes/messages') {
    console.log(123, 'Serving request type ' + request.method + ' for url ' + request.url);
    if (request.method === 'GET') {

      // The outgoing status.
      var statusCode = 200;

      // See the note below about CORS headers.

      // Tell the client we are sending them plain text.
      //
      // You will need to change this if you are sending something
      // other than plain text, like JSON or HTML.
      headers['Content-Type'] = 'text/plain';

      // .writeHead() writes to the request line and headers of the response,
      // which includes the status and all headers.
      response.writeHead(statusCode, headers);

      // Make sure to always call response.end() - Node may not send
      // anything back to the client until you do. The string you pass to
      // response.end() will be the body of the response - i.e. what shows
      // up in the browser.
      //
      // Calling .end "flushes" the response's internal buffer, forcing
      // node to actually send all the data over to the client.
      response.end(JSON.stringify(messagesArr));

    } else if (request.method === 'POST') {
      headers['Content-Type'] = 'text/plain';
      var message = [];
      request.on('data', (chunk) => {
        message.push(chunk);
      });

      request.on('end', () => {
        message = Buffer.concat(message).toString();
        message = JSON.parse(message);
        if (typeof message !== 'object' || Array.isArray(message)) {
          var statusCode = 400;
        } else if (message.text.toLowerCase().includes('brew coffee')) {
          var statusCode = 418;
          response.writeHead(statusCode, headers);
          response.end(`I'm a teapot :)`);
        } else {
          var statusCode = 201;
          messagesArr.push(message);
        }
        response.writeHead(statusCode, headers);
        response.end();
      });

    } else if (request.method === 'OPTIONS') {
      var statusCode = 200;
      headers['Content-Type'] = 'text/plain';
      response.writeHead(statusCode, headers);
      response.end();

    } else if (request.method === 'DELETE') {
      var message = [];
      request.on('data', (chunk) => {
        message.push(chunk);
      });

      request.on('end', () => {
        message = Buffer.concat(message).toString();
        message = JSON.parse(message);
        var messagesFound = false;
        for (var i = 0; i < messagesArr.length; i++) {
          if ((messagesArr[i].username === message.username) && (messagesArr[i].text === message.text)) {
            messagesArr.splice(i, 1);
            messagesFound = true;
            break;
          }
        }

        if (messagesFound === true) {
          var statusCode = 200;
        } else {
          var statusCode = 404;
        }
        response.writeHead(statusCode, headers);
        response.end();
      });
    }
  } else {
    var statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end();
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
// var defaultCorsHeaders = {
//   'access-control-allow-origin': '*',
//   'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'access-control-allow-headers': 'content-type, accept, authorization',
//   'access-control-max-age': 10 // Seconds.
// };

// module.exports = requestHandler;
exports.requestHandler = requestHandler;