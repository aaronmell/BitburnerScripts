import { ExtendedServer } from "/mcp/interfaces";
import { getServerData, LaunchScript } from "/mcp/utils";

/** @param {NS} ns */
export async function main(ns: NS) {
    const serverMap = getServerData(ns);
    const unhackedServerNames = Object.entries(serverMap)
        .filter((x) => !x[1].hasAdminRights)
        .map((x) => x[0]);

    if (unhackedServerNames.length === 0) {
        ns.printf("All servers hacked writing file");
        await ns.write("/mcp/data/all_servers_hacked.txt", "", "w");
        return;
    }

    for (const serverName of unhackedServerNames) {
        await hackServer(ns, serverName, serverMap[serverName]);
    }
}

/** @param {NS} ns */
async function hackServer(
    ns: NS,
    serverName: string,
    serverObject: ExtendedServer
) {
    if (ns.hasRootAccess(serverName)) {
        ns.printf("%s already hacked", serverName);
        return true;
    }

    if (!serverObject.sqlPortOpen) {
        LaunchScript(ns, {
            scriptName: "/mcp/nuke_servers/sql_inject.js",
            targetServer: "home",
            threads: 1,
            args: [serverName],
        });
        await ns.sleep(20);
    }

    if (!serverObject.httpPortOpen) {
        LaunchScript(ns, {
            scriptName: "/mcp/nuke_servers/http_worm.js",
            targetServer: "home",
            threads: 1,
            args: [serverName],
        });
        await ns.sleep(20);
    }

    if (!serverObject.smtpPortOpen) {
        LaunchScript(ns, {
            scriptName: "/mcp/nuke_servers/relay_smtp.js",
            targetServer: "home",
            threads: 1,
            args: [serverName],
        });
        await ns.sleep(20);
    }

    if (!serverObject.ftpPortOpen) {
        LaunchScript(ns, {
            scriptName: "/mcp/nuke_servers/ftp_crack.js",
            targetServer: "home",
            threads: 1,
            args: [serverName],
        });
        await ns.sleep(20);
    }

    if (!serverObject.sshPortOpen) {
        LaunchScript(ns, {
            scriptName: "/mcp/nuke_servers/brute_ssh.js",
            targetServer: "home",
            threads: 1,
            args: [serverName],
        });
        await ns.sleep(20);
    }

    if (serverObject.openPortCount >= serverObject.numOpenPortsRequired) {
        LaunchScript(ns, {
            scriptName: "/mcp/nuke_servers/nuke_server.js",
            targetServer: "home",
            threads: 1,
            args: [serverName],
        });
    }
    return true;
}
