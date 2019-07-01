import { IEngineConstructor } from "../providers/exporters/engines";

export interface ICrawler {
  import(): Promise<void>;
  export(outputDirPath: string, engine: IEngineConstructor): Promise<void>;
  load(): void;
  save(): void;
  isDone: boolean;
}

export interface ICrawlingContentInfo {
  title: string;
  url: string;
  content: string | null;
  category: string;
  tags: string[];
  date: Date | null;
}

