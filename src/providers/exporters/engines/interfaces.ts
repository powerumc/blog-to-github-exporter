
export interface IEngineConstructor {
  new (): IEngine;
}

export interface IEngine {
  generate(html: string): Promise<string>;
}