type Falsy = false | null | undefined;

export class BemBuilder {
  constructor(
    private blockName: string,
    private styles: Record<string, string>,
  ) {}

  block(...modifiers: (string | Falsy)[]): string {
    return this.buildClassName(this.blockName, modifiers);
  }

  element(el: string, ...modifiers: (string | Falsy)[]): string {
    return this.buildClassName(`${this.blockName}__${el}`, modifiers);
  }

  private buildClassName(base: string, modifiers: (string | Falsy)[]): string {
    return [
      this.styles[base],
      ...modifiers.filter(Boolean).map((mod) => this.styles[`${base}--${mod}`]),
    ]
      .filter(Boolean)
      .join(" ");
  }
}
