const fs = require("fs");

module.exports = (socket, cb) => {
  socket.setEncoding("utf8");
  socket.write(
    fs.readFileSync("welcome_message.txt", "utf8")
  );

  socket.write(
    "So who are you?: "
  );

  socket.on('data', data => {
    if (data.length < 4) return socket.write("Too short. Try again.\nSo who are you?: ");
    if (data.length > 30) return socket.write("Your name is too long. Try again.\nSo who are you?: ");
    socket.removeAllListeners('data');
    cb(data.slice(0, data.length-1));
  });
}
