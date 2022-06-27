import { getServerFilename, ExtendedServer } from "./shared";

/** @param {NS} ns */
export async function main(ns: NS) {
  await buildServerList(ns);
}

/** @param {NS} ns */
async function buildServerList(ns: NS) {
  const serverMap = {};

  await getList(ns, "home", serverMap);

  await ns.write(getServerFilename(), JSON.stringify(serverMap), "w");
}

/** @param {NS} ns */
async function getList(
  ns: NS,
  serverName: string,
  serverMap: { [key: string]: ExtendedServer }
): Promise<void> {
  ns.printf("Scanning server %s", serverName);
  const servers = ns.scan(serverName);

  for (let i = 0; i < servers.length; i++) {
    if (servers[i] === "home") {
      continue;
    }

    const existingServer = serverMap[servers[i]];
    //Skip if already exists
    if (existingServer) {
      if (
        serverMap[servers[i]].parentServers &&
        !serverMap[servers[i]].parentServers.includes(serverName)
      ) {
        serverMap[servers[i]].parentServers.push(serverName);
      }
      ns.printf("Server %s already exists in map, skipping", serverName);
      continue;
    }

    ns.printf("Server %s Not Found Adding To Collection", servers[i]);

    const server = ns.getServer(servers[i]) as ExtendedServer;
    server.cctFiles = ns.ls(servers[i], ".cct");
    server.parentServers = [serverName];

    serverMap[servers[i]] = server;
    await getList(ns, servers[i], serverMap);
  }

  ns.printf("Done Scanning");
}
