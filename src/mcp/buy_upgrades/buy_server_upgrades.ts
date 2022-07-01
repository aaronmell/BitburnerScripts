/** @param {NS} ns */
export async function main(ns: NS) {
    const startRam = 128;
    const maxRam = 128;
    let i = 0;
    const serverLimit = ns.getPurchasedServerLimit();

    while (i < serverLimit) {
        const purchasedServers = getPurchasedServers(ns);

        if (purchasedServers.length === serverLimit) {
            ns.printf(
                "%s purchased servers equals %s server limit, skipping to upgrade",
                purchasedServers,
                serverLimit
            );
            i = serverLimit;
            break;
        }

        if (!fundsAvailable(ns, startRam)) {
            await ns.sleep(1000);
            continue;
        }

        const serverName = "pserv-" + i;
        purchaseServer(ns, serverName, startRam);
        ++i;
    }

    const servers = ns.getPurchasedServers();

    for (let j = 0; j < servers.length; j++) {
        const oldServer = servers[j];
        const oldServerRam = ns.getServerMaxRam(oldServer);

        if (oldServerRam >= maxRam) {
            ns.printf("%s already at max ram %s", oldServer, oldServerRam);
            continue;
        }

        while (!fundsAvailable(ns, maxRam)) {
            await ns.sleep(10000);
            continue;
        }

        while (ns.ps(oldServer).length > 0) {
            await ns.sleep(1000);
            continue;
        }

        const serverName = "pserv-" + j;
        ns.printf("%s server name", serverName);

        ns.killall(oldServer);
        ns.deleteServer(oldServer);
        purchaseServer(ns, serverName, maxRam);
    }
}

/** @param {NS} ns */
function purchaseServer(ns: NS, name: string, ram: number) {
    ns.purchaseServer(name, ram);
}

/** @param {NS} ns */
function fundsAvailable(ns: NS, ram: number) {
    return ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram);
}

function getPurchasedServers(ns: NS) {
    return ns.getPurchasedServers();
}
