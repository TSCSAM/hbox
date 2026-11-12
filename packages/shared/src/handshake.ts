export interface HelloMessage {
  type: "hbox-hello";
  version: string;
  platform: string;
  arch: string;
  pid: number;
}

export interface HelloAckMessage {
  type: "hbox-hello-ack";
  version: string;
  clientId: string;
}
