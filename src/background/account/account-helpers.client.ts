import { BrowserStorage } from '@/background/webapis/storage';
import { currentUserKey } from '@/shared/get-current-user';
import type { User } from '@/shared/types/User';

export async function getUserId() {
  const user = await BrowserStorage.get<User>(currentUserKey);
  return user?.id;
}
