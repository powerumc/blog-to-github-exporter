import path from "path";
import fs from "fs";
import { ExporterProvider } from "./exporter-provider";
import { ILogger } from "../../logging";
import { Exporter } from "../../interfaces";
import { ICrawlingContentInfo } from "../../crawls";
import moment = require("moment");

@Exporter("jekyll")
export class JekyllExporterProvider extends ExporterProvider {

  constructor(logger: ILogger) {
    super(logger);
  }

  protected validateDir(outputDirPath: string): void {
    const basePath = path.resolve(outputDirPath);

    if (!fs.existsSync(path.join(basePath, "_config.yml")) ||
      !fs.existsSync(path.join(basePath, "_posts"))) {
        throw new Error(`It's not hexo directory: ${outputDirPath}`);
    }
  }
  
  protected getPostDirPath(outputDirPath: string): string {
    return path.join(path.resolve(outputDirPath), "_posts");
  }

  protected getPostFilePath(postOutputDirPath: string, content: ICrawlingContentInfo): string {
    const date = moment(content.date!.toString()).format("YYYY-MM-DD");
    const filename = this.getNormalizedFileName(content.title) + ".md";
    const filepath = `${date}-${filename}`;
    return path.join(postOutputDirPath, filepath);
  }

  protected getPostFormat(outputDirPath: string, content: ICrawlingContentInfo): string {
    const title = content.title.replace(/\"/g, "\\\"");
    const date = moment(content.date!.toString()).format("YYYY-MM-DD HH:mm:ss");
    const tags = JSON.stringify(content.tags || []);

    return `---
layout: post
title: "${title}"
date: ${date}
categories: ${tags}
---
`;
  }

}