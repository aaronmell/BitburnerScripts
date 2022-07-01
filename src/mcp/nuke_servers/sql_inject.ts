/** @param {NS} ns */
export async function main(ns: NS) {
    const serverName = ns.args[0] as string;

    if (!ns.fileExists("SQLInject.exe")) {
        ns.printf("SQLInject not created yet skipping server %s", serverName);
        return;
    }
    ns.sqlinject(serverName);
}
