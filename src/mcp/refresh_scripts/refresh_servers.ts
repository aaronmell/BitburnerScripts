import { getServerFilename } from "/mcp/constants";
import { ExtendedServer } from "/mcp/interfaces";
/** @param {NS} ns */
export async function main(ns: NS) {
    await buildServerList(ns);
}

/** @param {NS} ns */
async function buildServerList(ns: NS) {
    const serverMap: { [key: string]: ExtendedServer } = {};
    await getList(ns, "home", serverMap);
    serverMap["home"] = getServer(ns, "home", "");
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
        const server = getServer(ns, servers[i], serverName);
        serverMap[servers[i]] = server;
        await getList(ns, servers[i], serverMap);
    }

    ns.printf("Done Scanning");
}

function getServer(
    ns: NS,
    serverName: string,
    parentServerName: string
): ExtendedServer {
    const server = ns.getServer(serverName) as ExtendedServer;
    server.cctFiles = ns.ls(serverName, ".cct");
    server.parentServers = [parentServerName];

    return server;
}
