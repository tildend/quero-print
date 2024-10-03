export class Resposta extends Response {
  constructor(body: Record<string, unknown>, options?: ResponseInit) {
    const parsedBody = JSON.stringify(body);
    super(parsedBody, options);

    this.headers.set('Content-Type', 'application/json');
  }
}

export type ResAPI<T=undefined> = {
  res?: T;
  mensagem?: string;
  erro?: string;
}