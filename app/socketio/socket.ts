import { Server, Socket } from "socket.io";
import { IUser } from "../types/types";
import { Room } from "./Room";

interface Messages {
  Public: object[];
}

interface SendMessage {
  content: object;
  to: string;
  sender: string;
  chatName: string;
  isChannel: boolean;
  sid: string;
}

const publicRoom = new Room("Public", "public");

export const socketSetup = (server: import("http").Server) => {
  let users: any[] = [];
  const messages: Messages = {
    Public: [],
  };

  const rooms: { [key: string]: Room } = {
    public: publicRoom,
  };

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected", socket.id);

    socket.on("join_server", (user: any) => {
      user.sid = socket.id;
      users = users.filter((_user) => _user.id !== user.id);
      users.push(user);

      io.emit("new_user", users);
      io.to(socket.id).emit("my_socket", socket.id);
    });

    socket.on("join_room", ({ roomName, user }) => {

      if (!rooms[roomName]) {
        socket.emit('no_room', "The provided room doesn't exists.")
        return
      }

      socket.join(roomName);
      socket.emit("joined_room", roomName);
      let newRoom;
      if (rooms[roomName]) {
        const room = rooms[roomName];
        room.addUser(user);
        newRoom = room;
      } else {
        rooms[roomName] = new Room(roomName, user?.username);
        newRoom = rooms[roomName];
      }

      socket.to(roomName).emit("room", newRoom);
    });

    socket.on("create_room", ({ roomName, user }) => {

      socket.join(roomName);
      socket.emit("joined_room", roomName);
      let newRoom;
      if (rooms[roomName]) {
        const room = rooms[roomName];
        room.addUser(user);
        newRoom = room;
      } else {
        rooms[roomName] = new Room(roomName, user?.username);
        newRoom = rooms[roomName];
      }

      socket.to(roomName).emit("room", newRoom);
    });

    socket.on(
      "send_message",
      ({ content, to, sid, sender, chatName, isChannel }: SendMessage) => {
        const payload = {
          content,
          chatName: sender,
          sender,
          sid: sid,
        };

        if (isChannel) {
          payload.chatName = chatName;
          socket.broadcast.to(to).emit("new_message_room", payload);
        } else {
          // it's not a channel
          socket.to(to).emit("new_message", payload);
        }

        if (messages[chatName as keyof Messages]) {
          messages[chatName as keyof Messages].push({
            sender,
            content,
          });
        }
      }
    );

    socket.on("remove_user_from_room", ({ id, room }) => {
      socket.to(room).emit("remove_me", { id, room });
    });

    socket.on("leave_room", ({ id, room }) => {
      socket.leave(room);
      const _room = rooms[room];
      _room.removeUser(id);

      socket.to(room).emit("room", _room);
    });

    socket.on("disconnect", () => {
      users = users.filter((u) => u.sid !== socket.id);
      io.emit("new_user", users);
    });
  });
};
