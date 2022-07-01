import { getStealScriptName, getStealTargetsFileName } from "/mcp/constants";
import { StealTarget } from "/mcp/interfaces";
import { getAdminServers } from "/mcp/utils";

/** @param {NS} ns */
export async function main(ns: NS) {
    const adminServers = getAdminServers(ns);
    const servers = [];

    const runningScripts = ns.ps("home");
    // ns.tprint(JSON.stringify(runningScripts));

    for (const server of adminServers) {
        const maxMoney = server.moneyMax;

        if (server.purchasedByPlayer) {
            continue;
        }

        if (maxMoney === 0) {
            ns.printf("Skipping %s as it does not have money", server.hostname);
            continue;
        }

        if (!server.hasAdminRights) {
            continue;
        }

        const weakenTime = ns.getWeakenTime(server.hostname);

        const hackTime = ns.getHackTime(server.hostname);

        const growTime = ns.getGrowTime(server.hostname);

        const totalTime = weakenTime + hackTime + growTime;

        servers.push({
            hostName: server.hostname,
            totalStealTime: Math.round(totalTime),
            currentlyRunning:
                runningScripts.filter(
                    (x) =>
                        x.filename === getStealScriptName() &&
                        x.args[0] === server.hostname
                ).length > 0,
        } as StealTarget);
    }
    servers.sort((x, y) => x.totalStealTime - y.totalStealTime);

    await ns.write(getStealTargetsFileName(), JSON.stringify(servers), "w");
}
