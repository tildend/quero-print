export type Jsonable = string | number | boolean | null | undefined | readonly Jsonable[] | { readonly [key: string]: Jsonable } | { toJSON(): Jsonable };

export class Erro {
  public readonly contexto?: Jsonable;
  public readonly mensagem: string;

  constructor(mensagem: string, contexto?: Jsonable) {
    this.contexto = contexto;
    this.mensagem = mensagem;
    
    console.error(this);
  }
}