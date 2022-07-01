/** @param {NS} ns */
export async function main(ns: NS) {
    const serverName = ns.args[0] as string;

    if (!ns.fileExists("relaySMTP.exe")) {
        ns.printf("relaySMTP not created yet skipping server %s", serverName);
        return;
    }
    ns.relaysmtp(serverName);
}
