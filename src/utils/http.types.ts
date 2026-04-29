export interface Request {
  body?: any;
  query?: any;
  params?: any;
}

export interface Response {
  statusCode: number;
  status(code: number): this;
  json(data: any): void;
}