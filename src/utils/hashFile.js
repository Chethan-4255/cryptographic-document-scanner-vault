/**
 * Hash a file's raw binary using SHA-256.
 * Converting to ArrayBuffer here because crypto-js needs raw binary to generate
 * an accurate hash — standard strings would mess up the fingerprint.
 */
import CryptoJS from 'crypto-js';

export async function hashFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer));
  return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
}
