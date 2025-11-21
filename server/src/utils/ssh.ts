import dotenv from "dotenv"

import { Client } from "ssh2";


dotenv.config();


const host=  process.env.EC2_HOST!;
const username=  process.env.EC2_USER!;
const password=  process.env.EC2_PASSWORD!;
const port= parseInt(process.env.SSH_PORT as string) || 22;


export const streamRemoteCommand = (
  command: string,
  onData: (chunk: string) => void,
  onClose: (closeMessage:string) => void,
  onError?: (err: Error) => void
) => {
  const conn = new Client();

  conn
    .on("ready", () => {
        onData("Connecting Server is ready....")
      conn.exec(command, (err, stream) => {
        if (err) {
          onError?.(err);
          conn.end();
          return;
        }

        stream
          .on("data", (chunk: Buffer) => onData(chunk.toString()))
          .stderr.on("data", (chunk: Buffer) => onData(`[stderr] ${chunk.toString()}`));

        stream.on("close", () => {
          onClose("Connection clonse");
          conn.end();
        });
      });
    })
    .on("error", (err) => {
      onError?.(err);
    })
    .connect({
      host,
      username,
      password,
      port,
    });
};
