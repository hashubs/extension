export class MethodNotImplemented extends Error {
  constructor(message = 'Method not implemented') {
    super(message);
    this.name = 'MethodNotImplemented';
  }
}

export class InvalidParams extends Error {
  constructor(message = 'Invalid params') {
    super(message);
    this.name = 'InvalidParams';
  }
}
