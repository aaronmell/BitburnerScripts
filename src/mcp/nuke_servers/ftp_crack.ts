/** @param {NS} ns */
export async function main(ns: NS) {
    const serverName = ns.args[0] as string;

    if (!ns.fileExists("FTPCrack.exe")) {
        ns.printf("FTPCrack not created yet skipping server %s", serverName);
        return;
    }
    ns.ftpcrack(serverName);
}
