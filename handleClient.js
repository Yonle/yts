const newconn = require("./components/newconn.js");
const handleuser = require("./components/handleuser.js");

module.exports = socket => {
  newconn(socket, name => {
    socket.write(`\nHello ${name}. Pleased to meet you.\n\n`);

    handleuser(name, socket);
  });

  socket.on('error', console.error);
}
