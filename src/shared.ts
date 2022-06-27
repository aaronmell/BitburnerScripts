import { Player, Server } from "NetscriptDefinitions";

const playerFileName = "player.json.txt";
const serverFileName = "servers.json.txt";

export function getPlayerFilename() {
  return playerFileName;
}

export function getServerFilename() {
  return serverFileName;
}

export function getPlayerData(ns: NS): Player {
  const playerString = ns.read(playerFileName);
  return JSON.parse(playerString);
}

export function getServerData(ns: NS): { [key: string]: ExtendedServer } {
  const serverString = ns.read(serverFileName);
  return JSON.parse(serverString);
}

export interface ExtendedServer extends Server {
  cctFiles: string[];
  parentServers: string[];
}
