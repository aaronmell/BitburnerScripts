import { Server } from "../../../NetscriptDefinitions";
import { getAdminServers } from "/mcp/utils";

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.disableLog("sleep");
    ns.disableLog("exec");
    const targetServerName = ns.args[0] as string;
    const hackPercentage = ns.args[1] as number;

    if (hackPercentage > 1) {
        ns.tprintf("Hack percentage %s is greater than 1", hackPercentage);
    }

    while (true) {
        const weakenRam = 1.75;
        let weakenThreads = getWeakenThreads(ns, targetServerName);
        while (weakenThreads > 0) {
            await ns.sleep(100);
            ns.printf("Need %s threads for weaken", weakenThreads);
            await launchScripts(
                ns,
                targetServerName,
                "/mcp/steal_money/weaken.js",
                getServerList(ns),
                weakenThreads,
                weakenRam
            );
            weakenThreads = getWeakenThreads(ns, targetServerName);
        }
        ns.printf("Weaken Finished");

        const growRam = 1.75;
        let growThreads = getGrowThreads(ns, targetServerName);
        while (growThreads > 0) {
            await ns.sleep(100);
            ns.printf("Need %s threads for grow", growThreads);
            await launchScripts(
                ns,
                targetServerName,
                "/mcp/steal_money/grow.js",
                getServerList(ns),
                growThreads,
                growRam
            );
            growThreads = getGrowThreads(ns, targetServerName);
        }

        weakenThreads = getWeakenThreads(ns, targetServerName);
        while (weakenThreads > 0) {
            await ns.sleep(100);
            ns.printf("Need %s threads for weaken", weakenThreads);
            await launchScripts(
                ns,
                targetServerName,
                "/mcp/steal_money/weaken.js",
                getServerList(ns),
                weakenThreads,
                weakenRam
            );
            weakenThreads = getWeakenThreads(ns, targetServerName);
        }

        const hackRam = 1.7;
        let hackThreads = getHackThreads(ns, targetServerName, hackPercentage);
        while (hackThreads > 0) {
            await ns.sleep(100);
            ns.printf("Need %s threads for hack", hackThreads);
            hackThreads = await launchScripts(
                ns,
                targetServerName,
                "/mcp/steal_money/hack.js",
                getServerList(ns),
                hackThreads,
                hackRam
            );
        }
        await ns.sleep(100);
    }
}

/** @param {NS} ns */
function getServerList(ns: NS): Server[] {
    const servers = getAdminServers(ns);
    return servers.sort(
        (x, y) => y.maxRam - y.ramUsed - (x.maxRam - x.ramUsed)
    );
}

/** @param {NS} ns */
function getServer(ns: NS, serverName: string): Server {
    const server = ns.getServer(serverName);
    return server;
}
/** @param {NS} ns */
function getHackThreads(
    ns: NS,
    serverName: string,
    hackPercentage: number
): number {
    const server = getServer(ns, serverName);
    const hackThreads = Math.floor(
        ns.hackAnalyzeThreads(
            serverName,
            server.moneyAvailable * hackPercentage
        )
    );
    ns.printf(
        "Need %s threads to steal %s dollars from %s",
        hackThreads,
        server.moneyAvailable * 0.5,
        serverName
    );

    return hackThreads;
}
/** @param {NS} ns */
function getGrowThreads(ns: NS, serverName: string): number {
    const server = getServer(ns, serverName);
    const growthFactor =
        Math.floor(server.moneyMax / server.moneyAvailable) + 1;

    if (server.moneyMax === server.moneyAvailable) {
        return 0;
    }

    ns.printf(
        "MaxMoney is %s Avail is %s growth factor is %s",
        server.moneyMax,
        server.moneyAvailable,
        growthFactor
    );

    const growthThreads = Math.floor(
        ns.growthAnalyze(serverName, growthFactor)
    );
    ns.printf(
        "Need %s threads to grow %s on %s",
        growthThreads,
        growthFactor,
        serverName
    );

    return growthThreads;
}
/** @param {NS} ns */
function getWeakenThreads(ns: NS, serverName: string): number {
    const server = getServer(ns, serverName);
    const minimumSec = server.minDifficulty;
    const weakenThreads = Math.floor(
        (ns.getServerSecurityLevel(serverName) - minimumSec) / 0.05
    );
    ns.printf("Need %s threads to weaken %s", weakenThreads, serverName);
    return weakenThreads;
}
/** @param {NS} ns */
async function launchScripts(
    ns: NS,
    target: string,
    scriptName: string,
    servers: Server[],
    threads: number,
    scriptCost: number
): Promise<number> {
    let remainingThreads = threads;

    const pids = [];

    for (const server of servers) {
        if (!ns.serverExists(server.hostname)) {
            ns.printf("Server %s doesn't exist", server);
            continue;
        }

        let availableRam = server.maxRam - server.ramUsed;

        if (server.hostname === "home") {
            availableRam -= 25;
        }

        const maxServerThreads = Math.floor(availableRam / scriptCost);
        const threadsToUse =
            maxServerThreads > remainingThreads
                ? remainingThreads
                : maxServerThreads;

        if (threadsToUse < 1) {
            continue;
        }

        pids.push({
            pid: ns.exec(scriptName, server.hostname, threadsToUse, target),
            hostname: server.hostname,
        });

        remainingThreads = remainingThreads - threadsToUse;
        ns.printf(
            "Have %s threads for %s remaining",
            remainingThreads,
            scriptName
        );
        if (remainingThreads <= 0) {
            break;
        }
    }

    if (pids.length === 0) {
        ns.printf("This shouldn't happen");
    }

    let remainingWork = pids
        .map((x) => ns.isRunning(x.pid, x.hostname))
        .filter((x) => x).length;

    while (remainingWork > 0) {
        await ns.sleep(1000);
        remainingWork = pids
            .map((x) => ns.isRunning(x.pid, x.hostname))
            .filter((x) => x).length;
    }

    return remainingThreads;
}
