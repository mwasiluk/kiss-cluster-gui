import { Injectable } from '@angular/core';
import {DatePipe} from "@angular/common";

@Injectable()
export class UtilsService {

  constructor(private datePipe: DatePipe) { }

  transformDate(date): string {
    return this.datePipe.transform(date, 'yMMddTZ');
  }


  getCreator() {
    return 'user' + '@' + 'kiss-cluster-gui';
  }
}
