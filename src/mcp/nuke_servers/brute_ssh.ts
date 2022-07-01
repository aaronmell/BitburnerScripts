/** @param {NS} ns */
export async function main(ns: NS) {
    const serverName = ns.args[0] as string;

    if (!ns.fileExists("BruteSSH.exe")) {
        ns.printf("BruteSSH not created yet skipping server %s", serverName);
        return;
    }
    ns.brutessh(serverName);
}
