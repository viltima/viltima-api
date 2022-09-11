import { IUser } from "../types/types";

export class Room {
  users: IUser[] = [];
  name: string = "";
  owner: string = "";

  constructor(name: string, owner: string) {
    this.name = name;
    this.owner = owner;
  }

  addUser(user: IUser) {
    if (!this.userExists(user.id)) {
      this.users.push(user);
    }
    return this.users;
  }

  userExists(id: string) {
    return !!this.users.filter((user) => user.id === id).length;
  }

  removeUser(id: string) {
    this.users = this.users.filter((user) => user.id !== id);
    return this.users;
  }

  getUsers() {
    return this.users;
  }
}
