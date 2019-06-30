const upndown = require("upndown");
import { IEngine } from ".";
import { Engine } from "../../../interfaces";

@Engine("upndown")
export class UpndownEngine implements IEngine {

  private engine = new upndown();

  async generate(html: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.engine.convert(html, (err: any, markdown: string) => {
        try {
          return resolve(markdown);
        } catch (e) {
          return reject(e);
        }
      });
    })
  }

}