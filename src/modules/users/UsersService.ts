import { COLLECTIONS } from "@/lib/firestore";

import { FirestoreService } from "@/lib/firestore";
import type { User } from "@/types/models";
export class UsersService extends FirestoreService<User> {
  constructor() {
    super(COLLECTIONS.USERS);
  }
}

export const usersService = new UsersService();
