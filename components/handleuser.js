let posts = [];
let messages = [];
let voices = new Set();

module.exports = (name, socket) => {
  let state = 0;
  // States:
  // 0 - Main menu
  // 1 - Timeline
  // 1.1 - On making posts
  // 1.2 - On replying
  // 1.3 - On viewing comments
  // 2 - Global Messages.

  let mynewposts = "";

  socket.write(
    "Main Menu\n" +
    "=========\n\n" +
    "1. Timeline\n" +
    "2. Global Messages\n\n" +
    "Select: "
  );

  socket.on('data', data => {
    switch (state) {
      case 0:
        switch (true) {
          case data.startsWith("1"):
            state = 1;
            socket.emit('data', data);
            break;
          case data.startsWith("2"):
            state = 2;
            messages.forEach(i => socket.write(i + "\n"));
            voices.add(socket);
            socket.write("\nTip: Write a message, or type \".QUIT\" to back to main menu.\n");
            break;
          default:
            socket.write(
              "Main Menu\n" +
              "=========\n\n" +
              "1. Timeline\n" +
              "2. Global Messages\n\n" +
              "Select: "
            );
            break;
        }
        break;
      case 1:
        switch (true) {
          case data.startsWith("y"):
            state = 1.1;
            socket.write("\n=== TIP ===\nOnce finished writting,\nType \".EOM\" in the end of your post.\nOr type \".CANCEL\" to cancel.\n\nNote, This could not be undone.\n\n[Press ENTER to start writting]");
            break;
          case data.startsWith("n"):
            state = 0;
            socket.emit('data', data);
            break;
          default:
            posts.forEach(d => {
              socket.write("\n");
              socket.write(d);
            });
            if (!posts.length) socket.write("[Empty]");
            socket.write("\nWould you like to write a post? [y/n]: ");
            break;
        }
        break;
      case 1.1: {
        if (data.startsWith(".CANCEL")) {
          mynewposts = "";
          state = 1;
          return socket.write("Cancelled. Press RETURN to go back to timeline.");
        }
        if (!data.startsWith(".EOM")) return mynewposts += data;
        posts.push(
          `  --- ${name} at ${(new Date()).toGMTString()}:` +
          mynewposts.split("\n").map(i => "      " + i).join("\n")
        );

        mynewposts = "";
        socket.write("Done!\n\n[Press RETURN to go back to timeline]");
        state = 1;

        if (posts.length > 50) posts.shift();
        break;
      }
      case 2:
        if (data.startsWith(".QUIT")) {
          state = 0;
          voices.delete(socket);
          return socket.emit('data', data);
        }
        if (data.split("\n")[0]?.length) {
          let msg = `-- ${name}:\n` + data.split("\n").map(i => "   " + i).join("\n");
          messages.push(msg);
          if (messages.length > 50) messages.shift();

          voices.forEach(sock =>
            sock.write(msg + "\n")
          );
        } else socket.write("\nTip: Write a message, or type \".QUIT\" to back to main menu.\n");
        break;
    }
  });

  socket.on('close', _ => voices.delete(socket));
}
