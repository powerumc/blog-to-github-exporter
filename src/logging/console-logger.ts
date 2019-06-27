import os from "os";
import { ILogger } from "./interfaces";

export class ConsoleLogger implements ILogger {

    write(message: any): void {
        process.stdout.write(message);
    }
    
    writeLine(message?: any): void {
        process.stdout.write((message || "") + os.EOL);
    }
    
}