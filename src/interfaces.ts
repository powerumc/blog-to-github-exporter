import "reflect-metadata";
import { IImporterProvider, IExporterProvider } from "./providers";
import { URIComponents } from "uri-js";

export interface IBlog {
  title: string;
  url: URIComponents;
  description: string;
  owner: string;
  feeds: IBlogFeed[];
  date: Date;
}

export interface IBlogFeed {
  title: string;
  article: string;
  tags: string[];
}

export const importers: { [name: string]: IImporterProvider} = {};
export const exporters: { [name: string]: IExporterProvider} = {};

export function Importer(name: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    if (Object.keys(importers).includes(name)) {
      throw new Error(`Already exists importer name '${name}'`);
    }

    importers[name] = <IImporterProvider><unknown>constructor;

    return class extends constructor { }
  }
}

export function Exporter(name: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    if (Object.keys(exporters).includes(name)) {
      throw new Error(`Already exists exporter name '${name}'`);
    }

    exporters[name] = <IExporterProvider><unknown>constructor;

    return class extends constructor { }
  }
}