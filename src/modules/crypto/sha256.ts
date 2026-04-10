import { getSHA256HexDigest } from './get-sha256-hex-digest';

export async function sha256({
  password,
  salt,
}: {
  password: string;
  salt: string;
}) {
  return await getSHA256HexDigest(`${salt}:${password}`);
}
