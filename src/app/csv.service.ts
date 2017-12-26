import {Injectable} from '@angular/core';
import * as papa from 'papaparse';
import {Credentials} from 'aws-sdk';

@Injectable()
export class CredentialsCsvService {

  constructor() {
  }

  parse(file: File): Promise<Credentials> {
    return new Promise<Credentials>(function (resolve, reject) {
      papa.parse(file, {
        header: true,
        complete: function (result) {

          if (!result.data.length) {
            reject();
          }
          const data = result.data[0];

          resolve(new Credentials(data['Access key ID'], data['Secret access key']));
        },
        error: function(error) {
          reject(error);
        }
      });
    });
  }

}
