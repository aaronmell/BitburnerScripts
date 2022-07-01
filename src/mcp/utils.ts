import {
    ExtendedServer,
    RollingResource,
    RunParameters,
    StealTarget,
} from "./interfaces";
import { Player, Server } from "../../NetscriptDefinitions";
import {
    getPlayerFilename,
    getRollingResourceFilename,
    getServerFilename,
    getStealTargetsFileName,
} from "/mcp/constants";

export function LaunchScript(ns: NS, runParameters: RunParameters): number {
    const pid = ns.exec(
        "/mcp/launch_script.js",
        "home",
        1,
        JSON.stringify(runParameters)
    );

    if (pid === 0) {
        ns.printf("/mcp/launch_script.js failed to launch");
    }

    return pid;
}

export function getPlayerData(ns: NS): Player {
    const playerString = ns.read(getPlayerFilename());
    return JSON.parse(playerString);
}

export function getServerData(ns: NS): { [key: string]: ExtendedServer } {
    const serverString = ns.read(getServerFilename());
    return JSON.parse(serverString);
}

export function getStealTargets(ns: NS): StealTarget[] {
    const stealTargets = ns.read(getStealTargetsFileName());
    return JSON.parse(stealTargets);
}

export function getAdminServers(ns: NS): Server[] {
    const serverNames = Object.entries(getServerData(ns))
        .filter((x) => x[1].hasAdminRights)
        .map((x) => x[0]);

    const servers: Server[] = [];
    serverNames.forEach((serverName) => {
        if (ns.serverExists(serverName)) {
            servers.push(ns.getServer(serverName));
        }
    });

    return servers;
}

export function getRollingResoureData(ns: NS): RollingResource | null {
    const rollingResourceString = ns.read(getRollingResourceFilename());

    if (rollingResourceString === "") {
        return null;
    }

    return JSON.parse(rollingResourceString);
}
