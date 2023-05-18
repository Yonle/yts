const net = require("net");
const server = net.createServer();

server.on('connection', require('./handleClient.js'));
server.on('error', console.error);

server.listen(3001);
