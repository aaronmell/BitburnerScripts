/** @param {NS} ns */
export async function main(ns: NS) {
    const fileName = ns.args[0] as string;
    const serverName = ns.args[1] as string;

    if (ns.fileExists(fileName, serverName)) {
        ns.rm(fileName, serverName);
    }
}
