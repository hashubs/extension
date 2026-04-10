import { decrypt, encrypt } from '@/modules/crypto/aes';
import { eraseAndUpdateToLatestVersion } from '@/shared/core/version/shared';
import type { PublicUser } from '@/shared/types/User';
import { Account } from './account';

export type PublicMethodParams<T = undefined> = T extends undefined
  ? never
  : { params: T };

export class AccountPublicRPC {
  private account: Account;

  constructor(account: Account) {
    this.account = account;
  }

  async isAuthenticated() {
    return this.account.isAuthenticated();
  }

  async getExistingUser(): Promise<PublicUser | null> {
    const user = await Account.readCurrentUser();
    if (user) {
      return { id: user.id };
    }
    return null;
  }

  async login({
    params: { user, password },
  }: PublicMethodParams<{
    user: PublicUser;
    password: string;
  }>): Promise<PublicUser | null> {
    const currentUser = await Account.readCurrentUser();
    if (!currentUser || currentUser.id !== user.id) {
      throw new Error(`User ${user.id} not found`);
    }
    const canAuthorize = await this.account.verifyPassword(
      currentUser,
      password
    );
    if (canAuthorize) {
      await this.account.login(currentUser, password);
      return user;
    } else {
      throw new Error('Incorrect password');
    }
  }

  async hasActivePasswordSession() {
    return this.account.hasActivePasswordSession();
  }

  async createUser({
    params: { password },
  }: PublicMethodParams<{
    password: string; // TODO: maybe change to LocallyEncoded type?
  }>): Promise<PublicUser> {
    const user = await Account.createUser(password);
    await this.account.setUser(user, { password }, { isNewUser: true });
    return { id: user.id };
  }

  async saveUserAndWallet() {
    return this.account.saveUserAndWallet();
  }

  async isPendingNewUser() {
    return this.account.isPendingNewUser;
  }

  async logout() {
    return this.account.logout();
  }

  async eraseAllData() {
    await eraseAndUpdateToLatestVersion();
    await this.account.logout(); // reset account after erasing storage
  }

  async setPasskey({
    params: { encryptionKey, password, salt, id },
  }: PublicMethodParams<{
    encryptionKey: string;
    password: string;
    salt: string;
    id: string;
  }>) {
    const encrypted = await encrypt(encryptionKey, { password });
    return this.account.setEncryptedPassword({
      encryptedPassword: encrypted,
      salt,
      id,
    });
  }

  async getPasskeyMeta() {
    const data = await this.account.getEncryptedPassword();
    if (!data) {
      throw new Error('No passkey found');
    }
    const { id, salt } = data;
    return { id, salt };
  }

  async getPassword({
    params: { encryptionKey },
  }: PublicMethodParams<{ encryptionKey: string }>) {
    const data = await this.account.getEncryptedPassword();
    if (!data) {
      throw new Error('No passkey found');
    }
    const decrypted = await decrypt<{ password: string }>(
      encryptionKey,
      data.encryptedPassword
    );
    return decrypted.password;
  }

  async getPasskeyEnabled(): Promise<boolean> {
    const data = await this.account.getEncryptedPassword();
    return Boolean(data);
  }

  async removePasskey() {
    return this.account.removeEncryptedPassword();
  }

  async changePassword({
    params: { user, oldPassword, newPassword },
  }: PublicMethodParams<{
    oldPassword: string;
    newPassword: string;
    user: PublicUser;
  }>) {
    const currentUser = await Account.readCurrentUser();
    if (!currentUser || currentUser.id !== user.id) {
      throw new Error(`User ${user.id} not found`);
    }
    const passwordIsCorrect = await this.account.verifyPassword(
      currentUser,
      oldPassword
    );
    if (!passwordIsCorrect) {
      throw new Error('The current password is incorrect.');
    }
    await this.account.login(currentUser, oldPassword);
    /**
     * Passkey is used to encrypt/decrypt the password for passkey login.
     * When changing the password, we need to remove the existing passkey
     * to avoid inconsistencies.
     */
    await this.account.removeEncryptedPassword();
    return this.account.changePassword(currentUser, oldPassword, newPassword);
  }
}
