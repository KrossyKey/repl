import { Component, OnInit } from '@angular/core';
import clipboard from 'clipboard-polyfill';
import hash from 'object-hash';
import { CryptoUtil, CryptoAlg } from 'src/services/crypto';

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
    CryptoUtil.encryptObjectFromPhrase<{}>(this.passphrase,this.decryptedText, CryptoAlg.AESGCM).then((enc : string) => {
      this.encryptedText = enc;
    })
  }

  decryptText(){
    CryptoUtil.decryptStringFromPhrase<{}>(this.passphrase,this.encryptedText, CryptoAlg.AESGCM).then((dec : string) => {
      this.decryptedText = JSON.stringify(dec).replace(/\\\//g, "");
    })
  }


  

}
