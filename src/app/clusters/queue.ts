export class Queue {
  queueid?: number;
  creator?: string;
  date?: string;
  jobid?: number;
  maxjobid?: number;
  minjobid?: number;
  queue_name?: string;
  S3_location?: string;
  command?: string;
  qstatus?: string;

  $S3_bucket?: string;
  $folder?: string;
}
