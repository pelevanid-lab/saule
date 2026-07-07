export interface EncryptedEnvelope {
  ciphertext: string;
  iv: string;
  tag: string;
  salt: string;
}

export class CryptoUtils {
  private static ITERATIONS = 100000;

  private static hexToBuf(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  private static bufToHex(buf: ArrayBuffer | Uint8Array): string {
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static async importKey(dekHex: string): Promise<CryptoKey> {
    const keyBytes = this.hexToBuf(dekHex);
    return await crypto.subtle.importKey(
      'raw',
      keyBytes as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generates a cryptographically secure random 256-bit symmetric key (DEK).
   */
  public static generateDEK(): string {
    const keyBytes = new Uint8Array(32);
    crypto.getRandomValues(keyBytes);
    return this.bufToHex(keyBytes);
  }

  /**
   * Encrypts plain text using the DEK via Web Crypto API.
   */
  public static async encrypt(text: string, dekHex: string): Promise<EncryptedEnvelope> {
    const key = await this.importKey(dekHex);
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    const encodedText = new TextEncoder().encode(text);
    const encryptedBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encodedText
    );

    // Web Crypto appends the 16-byte auth tag at the end of the ciphertext
    const encryptedBytes = new Uint8Array(encryptedBuf);
    const ciphertextBytes = encryptedBytes.slice(0, encryptedBytes.length - 16);
    const tagBytes = encryptedBytes.slice(encryptedBytes.length - 16);

    return {
      ciphertext: this.bufToHex(ciphertextBytes),
      iv: this.bufToHex(iv),
      tag: this.bufToHex(tagBytes),
      salt: this.bufToHex(salt)
    };
  }

  /**
   * Decrypts ciphertext using the DEK via Web Crypto API.
   */
  public static async decrypt(envelope: EncryptedEnvelope, dekHex: string): Promise<string> {
    const key = await this.importKey(dekHex);
    const iv = this.hexToBuf(envelope.iv);
    const ciphertextBytes = this.hexToBuf(envelope.ciphertext);
    const tagBytes = this.hexToBuf(envelope.tag);

    // Reconstruct the combined buffer that Web Crypto expects
    const combinedBuf = new Uint8Array(ciphertextBytes.length + tagBytes.length);
    combinedBuf.set(ciphertextBytes, 0);
    combinedBuf.set(tagBytes, ciphertextBytes.length);

    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      combinedBuf.buffer as ArrayBuffer
    );

    return new TextDecoder().decode(decryptedBuf);
  }
}
