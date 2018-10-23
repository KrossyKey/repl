import { Component, OnInit } from '@angular/core';
import clipboard from 'clipboard-polyfill';
import hash from 'object-hash';
import { CryptoUtil, CryptoAlg, ExportedDerivation } from 'src/services/crypto';

export interface TypeCreationDescriptor{
  typeName:string;
  typeCreationFunctions:Function[];
}


@Component({
  selector: 'text-box-view',
  templateUrl: './text-box-view.component.html',
  styleUrls: ['./text-box-view.component.css']
})

export class TextBoxViewComponent {
  encryptedText:string;
  decryptedText:string;
  passphrase:string;
  salt:string;
  constructor() { 

  }



  copyToClipboard(){
    if (this.decryptedText.length > 0){
    var dt = new clipboard.DT();
    dt.setData("text/plain", this.decryptedText);
    clipboard.write(dt);      
    }
  }

  encryptText(){

      CryptoUtil.encryptObjectFromPhrase(this.passphrase,this.decryptedText, CryptoAlg.AESGCM).then((enc : ExportedDerivation) => {
        if (enc){
          this.encryptedText = enc.result;

          this.salt = enc.iv;
        }else{
          this.encryptedText = "";
          this.salt = "";
        }

      })

  }

  decryptText(){
      CryptoUtil.decryptStringFromPhrase(this.passphrase,this.encryptedText, CryptoAlg.AESGCM).then((dec : ExportedDerivation) => {
        if (dec){
          this.decryptedText = dec.result;
          this.salt = dec.iv;

        }else{
          this.decryptedText = "";
          this.salt = "";
        }

      })
    
  }


  

}
