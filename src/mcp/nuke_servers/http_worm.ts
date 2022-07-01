/** @param {NS} ns */
export async function main(ns: NS) {
    const serverName = ns.args[0] as string;

    if (!ns.fileExists("HTTPWorm.exe")) {
        ns.printf("HTTPWorm not created yet skipping server %s", serverName);
        return;
    }
    ns.httpworm(serverName);
}
