import * as fs from "fs";
import * as path from "path";
import moment from "moment";
import { Exporter } from "../..";
import { ICrawlingContentInfo } from "../../crawls";
import { ILogger } from "../../logging";
import { ExporterProvider } from ".";

@Exporter("hexo")
export class HexoExporterProvider extends ExporterProvider {
  
  constructor(logger: ILogger) {
    super(logger);
  }

  protected validateDir(outputDirPath: string): void {
    const basePath = path.resolve(outputDirPath);

    if (!fs.existsSync(path.join(basePath, ".gitignore")) ||
        !fs.existsSync(path.join(basePath, "_config.yml")) ||
        !fs.existsSync(path.join(basePath, "source/_posts")) ||
        !fs.existsSync(path.join(basePath, "scaffolds/post.md"))) {
      throw new Error(`It's not hexo directory: ${outputDirPath}`);
    }
  }

  protected getPostDirPath(outputDirPath: string): string {
    return path.join(path.resolve(outputDirPath), "source/_posts");
  }

  protected getPostFormat(outputDirPath: string, content: ICrawlingContentInfo): string {
    const title = content.title.replace(/\"/g, "\\\"");
    const date = moment(content.date!.toString()).format("YYYY-MM-DD HH:mm:ss");
    const tags = JSON.stringify(content.tags || []);
    
    return `---
title: "${title}"
date: ${date}
tags: ${tags}
---
`;
  }

}