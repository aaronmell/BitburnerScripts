import { getRollingResourceFilename } from "/mcp/constants";
import { RollingResource } from "/mcp/interfaces";
import { getAdminServers } from "/mcp/utils";

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.disableLog("sleep");
    const rollingMax: number[] = [];
    const rollingInUse: number[] = [];
    const rollingFree: number[] = [];

    while (true) {
        const servers = getAdminServers(ns);

        let maxMemory = 0;
        let memoryInUse = 0;
        let freeMemory = 0;

        for (const server of servers) {
            maxMemory += server.maxRam;
            memoryInUse += server.ramUsed;
            freeMemory += server.maxRam - server.ramUsed;
        }
        const avgMax = maxMemory / servers.length;
        const avgInUse = memoryInUse / servers.length;
        const avgFree = freeMemory / servers.length;
        rollingMax.push(maxMemory);
        rollingInUse.push(memoryInUse);
        rollingFree.push(freeMemory);

        ns.printf(
            "Max Mem: %s Avg Mem: %s Max Use: %s Avg Use: %s Max Free: %s Avg Free: %s",
            maxMemory,
            avgMax.toFixed(2),
            memoryInUse,
            avgInUse.toFixed(2),
            freeMemory,
            avgFree.toFixed(2)
        );

        if (rollingFree.length % 60 === 0) {
            let maxSum = 0;
            rollingMax.forEach((x) => (maxSum += x));
            const maxAvg = maxSum / rollingMax.length + 1;

            let useSum = 0;
            rollingInUse.forEach((x) => (useSum += x));
            const useAvg = useSum / rollingInUse.length + 1;

            const freeLow = Math.min(...rollingFree);

            ns.printf(
                "Rolling Max Avg %s In Use Avg %s Free Avg %s Free Low %s",
                maxAvg.toFixed(2),
                useAvg.toFixed(2),
                freeLow.toFixed(2),
                (freeLow / maxAvg).toFixed(2)
            );

            rollingMax.length = 0;
            rollingInUse.length = 0;
            rollingFree.length = 0;

            const output = {
                rollingMax: maxAvg,
                rollingInUse: useAvg,
                rollingFree: freeLow,
                freePercentage: freeLow / maxAvg,
            } as RollingResource;

            await ns.write(
                getRollingResourceFilename(),
                JSON.stringify(output),
                "w"
            );
        }

        await ns.sleep(1000);
    }
}
