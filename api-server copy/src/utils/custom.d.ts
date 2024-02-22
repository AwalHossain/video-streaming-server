declare module 'aws-sdk/clients/s3' {
    export interface S3 {
      destroy(): void;
      middlewareStack: any;
      send(): void;
    }
  }
  