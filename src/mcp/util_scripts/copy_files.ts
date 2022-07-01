import { getServerData } from "/mcp/utils";

/** @param {NS} ns */
export async function main(ns: NS) {
    const serverData = getServerData(ns);
    const files = ns.args as string[];

    for (const serverName of Object.keys(serverData)) {
        await ns.scp(files, serverName);
    }
}
