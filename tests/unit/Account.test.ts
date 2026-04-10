import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Account } from '@/background/account/account';
import { mockLocalStorage, mockSessionStorage, setupStorageMocks } from '../test-utils';
import { currentUserKey } from '@/shared/get-current-user';

describe('Account', () => {
  const PASSWORD = 'password123';

  beforeEach(async () => {
    setupStorageMocks();
    await mockLocalStorage.clear();
    await mockSessionStorage.clear();
  });

  it('should create a new user and login', async () => {
    const account = new Account();
    
    // 1. Create a new user (onboarding)
    const user = await Account.createUser(PASSWORD);
    expect(user.id).toBeDefined();
    expect(user.salt).toBeDefined();

    // 2. Set user (derives keys)
    await account.setUser(user, { password: PASSWORD }, { isNewUser: true });
    expect(account.isAuthenticated()).toBe(true);
    expect(account.getUser()).toEqual(user);
    expect(account.getEncryptionKey()).toBeDefined();

    // 3. Generate mnemonic to create pendingWallet
    await account.getCurrentWallet().uiGenerateMnemonic({ id: 1, params: { ecosystems: ['evm'] } });

    // 4. Save to persistent storage
    // Before saving, it should not be in BrowserStorage
    expect(await mockLocalStorage.get(currentUserKey)).toEqual({});

    await account.saveUserAndWallet();
    
    const storedUser = await mockLocalStorage.get(currentUserKey);
    expect(storedUser[currentUserKey]).toEqual(user);
  }, 15000);

  it('should fail login with incorrect password', async () => {
    const account = new Account();
    const user = await Account.createUser(PASSWORD);
    
    // Initial setup for the user
    await account.setUser(user, { password: PASSWORD }, { isNewUser: true });
    await account.getCurrentWallet().uiGenerateMnemonic({ id: 1, params: { ecosystems: ['evm'] } });
    await account.saveUserAndWallet();

    const anotherAccount = new Account();
    await expect(anotherAccount.login(user, 'wrong-password')).rejects.toThrow('Incorrect password');
    expect(anotherAccount.isAuthenticated()).toBe(false);
  }, 15000);

  it('should logout and clear session', async () => {
    const account = new Account();
    const user = await Account.createUser(PASSWORD);
    await account.setUser(user, { password: PASSWORD });
    
    expect(account.isAuthenticated()).toBe(true);
    
    await account.logout();
    
    expect(account.isAuthenticated()).toBe(false);
    expect(account.getUser()).toBeNull();
    
    // Check session storage is cleared (credentialsKey is used internally in Account)
    const session = await mockSessionStorage.get(null);
    expect(Object.keys(session).length).toBe(0);
  });

  it('should auto-unlock on initialize if credentials exist', async () => {
    const user = await Account.createUser(PASSWORD);
    const encryptionKey = 'mock-encryption-key';
    
    // Simulate already logged in state
    await mockLocalStorage.set({ [currentUserKey]: user });
    await mockSessionStorage.set({ 'credentials': { encryptionKey } });

    const account = new Account();
    
    // Mock verifyCredentials to return true for this test
    // since we are using a manually set encryptionKey
    jest.spyOn(account, 'verifyCredentials').mockResolvedValue(true);

    await account.initialize();
    
    expect(account.isAuthenticated()).toBe(true);
    expect(account.getUser()).toEqual(user);
    expect(account.getEncryptionKey()).toBe(encryptionKey);
  });
});
