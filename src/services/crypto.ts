
export enum CryptoAlg{
    AESGCM = "AES-GCM"
}

/*
  Encrypts and Decrypts Objects

*/
export class CryptoUtil {



  static decryptStringFromPhrase<T>(passphrase:string, encodedData : string, alg : CryptoAlg):Promise<T | null>{
  
    return this.importKey(passphrase).then((importedKey) => {
        return this.decryptStringFromKey<T>(importedKey,encodedData, alg);
      });
  }

  static decryptStringFromKey<T>(importedKey:CryptoKey, encodedData : string, alg : CryptoAlg):Promise<T | null>{
    //Decode string
      const decoded = this.stringToBuffer(window.atob(encodedData));
      const salt = decoded.slice(0,16);
      const data = decoded.slice(16);

        return this.deriveKey(importedKey,salt, alg).then((key) => {
          return (window.crypto.subtle.decrypt(
            {
                name: alg.toString(),
                iv: salt,
                tagLength: 128,
            },
            key,
            data
          ) as Promise<ArrayBuffer>)
          .then((decrypted) => {

            const encrytedString:string = this.bufferToString(new Uint8Array(decrypted));
            //Added extra for debugging
            var output:{} = JSON.parse(encrytedString)
            output["salt"] = data;
            return output as T;
          })
          .catch((error : Error) => {
              console.log(error)
            return null;
          });
        });
  }


  static generateKey(alg : CryptoAlg):Promise<string | null>{
    return (window.crypto.subtle.generateKey(
        {
            name: alg.toString(),
            length: 256, //can be  128, 192, or 256
        },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
    ) as Promise<CryptoKey>)
    .then((key : CryptoKey) =>{
        //returns a key object
      return CryptoUtil.exportKey(key);
    })
    .catch(() => {
      return null;
    });

  }


  static encryptObjectFromPhrase<T>(passphrase : string, object : T, alg : CryptoAlg):Promise<string>{

    return this.importKey(passphrase).then((importedKey) => {
      return this.encryptObjectFromKey<T>(importedKey,object, alg);
    });
  }

  static encryptObjectFromKey<T>(importedKey : CryptoKey, object : T, alg : CryptoAlg){
    const salt = this.generateSalt(); 

    return this.deriveKey(importedKey,salt,alg).then((key) => {
      return window.crypto.subtle.encrypt(
        {
            name: alg.toString(),
    
            //Don't re-use initialization vectors!
            //Always generate a new iv every time your encrypt!
            //Recommended to use 12 bytes length
            iv: salt,

    
            //Tag length (optional)
            tagLength: 128, //can be 32, 64, 96, 104, 112, 120 or 128 (default)
        },
        key, //from generateKey or importKey above
        this.stringToBuffer(JSON.stringify(object))
        ) 
        .then((encrypted) => {

          //Note: Converts to Base64 string
          //Concatonate typed arrays
          const saltLength = salt.length;
          const encryptedLength = encrypted.byteLength;
          const data = new Uint8Array(saltLength + encryptedLength);
          data.set(salt, 0);
          data.set(new Uint8Array(encrypted), saltLength);
          return window.btoa(this.bufferToString(data));
            //returns an ArrayBuffer containing the encrypted data
        });   
    });
  }



  /**
   * Converts from string to array buffer
   * Credits:  https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
   * @param str 
   */
  static stringToBuffer(str : string):Uint8Array{
    const encBuff = new Uint8Array(str.length);
    for (let i = 0; i < encBuff.length; i++) {
        encBuff[i] = str.charCodeAt(i);
    }
    return encBuff;
  }

  /**
   * Converts from array buffer to string
   * Credits:  https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
   * @param Array buffer 
   */
  static bufferToString(buf : ArrayBuffer | Uint8Array):string {
    return String.fromCharCode.apply(null, buf);
  }

  /**
   * Generates a salt
   * @returns IV representing salt
   */
  static generateSalt():Uint8Array{
    return window.crypto.getRandomValues(new Uint8Array(16)) as Uint8Array;
  }

  /**
   * Gets key from passprase
   * @param passphrase Passphrase to get key from
   */
  static importKey(passphrase : string):Promise<CryptoKey>{
    return  window.crypto.subtle.importKey(
      "raw", //only "raw" is allowed
      this.stringToBuffer(passphrase),
      "PBKDF2",
      false, //whether the key is extractable (i.e. can be used in exportKey)
      ["deriveKey", "deriveBits"] //can be any combination of "deriveKey" and "deriveBits"
    ) as Promise<CryptoKey>;
  }


  static exportKey(key : CryptoKey):Promise<string | null>{

    return (window.crypto.subtle.exportKey(
        "jwk", //can be "jwk" or "raw"
        key //extractable must be true
    ) as Promise<JsonWebKey>)
    .then((keydata) =>{
      const keyVal:string | undefined = keydata.k ;
      return keyVal !== undefined ? keyVal : null;
      //returns the exported key data
    })
    .catch(() => {
      return null;
    });
  }


  static deriveKey(importedKey : CryptoKey, salt : Uint8Array, alg : CryptoAlg):Promise<CryptoKey>{
    return window.crypto.subtle.deriveKey(
      {
          "name": "PBKDF2",
          salt,
          iterations: 45000, //Based on https://support.1password.com/pbkdf2/
          hash: {name: "SHA-512"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      importedKey, //your key from generateKey or importKey
      { //the key type you want to create based on the derived bits
          name: alg.toString(), //can be any AES algorithm ("AES-CTR", "AES-CBC", "AES-CMAC", "AES-GCM", "AES-CFB", "AES-KW", "ECDH", "DH", or "HMAC")
          //the generateKey parameters for that type of algorithm
          length: 256, //can be  128, 192, or 256
      },
      false, //whether the derived key is extractable (i.e. can be used in exportKey)
      ["encrypt", "decrypt"] //limited to the options in that algorithm's importKey
    ) as Promise<CryptoKey>;
  }





}