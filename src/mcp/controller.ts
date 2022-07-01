import { McpSettings, RunParameters } from "/mcp/interfaces";
import {
    getRollingResoureData,
    getStealTargets,
    LaunchScript,
} from "mcp/utils";
import { getStealScriptName } from "/mcp/constants";

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.disableLog("exec");
    ns.disableLog("sleep");
    const settingsPath = (
        ns.args[0] ? ns.args[0] : "/mcp/defaultSettings.json.txt"
    ) as string;

    const settings = loadSettings(ns, settingsPath);
    let count = 4;

    setup(ns, settings);

    while (true) {
        count = ++count;
        await controllerLoop(ns, count, settings);
        await ns.sleep(1000);
    }
}

function loadSettings(ns: NS, settingsPath: string): McpSettings {
    const controllerSettingsString = ns.read(settingsPath);
    // ns.printf("Settings are %s", controllerSettingsString);
    return JSON.parse(controllerSettingsString);
}
async function controllerLoop(ns: NS, count: number, settings: McpSettings) {
    if (count % 5 === 0) {
        await refreshServers(ns);
        await refreshPlayer(ns);
        await copyFiles(ns, [
            "/mcp/steal_money/grow.js",
            "/mcp/steal_money/weaken.js",
            "/mcp/steal_money/hack.js",
        ]);
        await hackServers(ns);
    }

    if (count % 69 === 0) {
        await stealMoney(ns, settings);
    }
}

function setup(ns: NS, settings: McpSettings) {
    if (settings.runResourceMonitor) {
        const runParameters: RunParameters = {
            scriptName: "/mcp/resource_monitor.js",
            targetServer: "home",
            args: [],
            threads: 1,
        };
        LaunchScript(ns, runParameters);
    }
    removeFile(ns, "/mcp/data/all_servers_hacked.txt", "home");
}

async function refreshServers(ns: NS) {
    LaunchScript(ns, {
        scriptName: "/mcp/refresh_scripts/refresh_servers.js",
        targetServer: "home",
        args: [],
        threads: 1,
    });
    await ns.sleep(20);
}
function hackServers(ns: NS) {
    LaunchScript(ns, {
        scriptName: "/mcp/nuke_servers/nuke_controller.js",
        targetServer: "home",
        args: [],
        threads: 1,
    });
}
async function copyFiles(ns: NS, files: string[]) {
    LaunchScript(ns, {
        scriptName: "/mcp/util_scripts/copy_files.js",
        targetServer: "home",
        args: files,
        threads: 1,
    });
    await ns.sleep(20);
}

function removeFile(ns: NS, file: string, serverName: string) {
    LaunchScript(ns, {
        scriptName: "/mcp/util_scripts/remove_file.js",
        targetServer: "home",
        args: [file, serverName],
        threads: 1,
    });
}
async function stealMoney(ns: NS, settings: McpSettings) {
    if (settings.runResourceMonitor === false) {
        ns.printf(
            "WARN: Cannot steal money if resource monitor is not running"
        );
        return;
    }

    const rollingResourceData = getRollingResoureData(ns);

    if (!rollingResourceData) {
        ns.printf("WARN: Unable to load rolling resource data.");
        return;
    }

    if (rollingResourceData.freePercentage < settings.stealThresholdPercent) {
        ns.printf(
            "Unable to add additional steal, Free is %s threshold is %s",
            rollingResourceData.freePercentage,
            settings.stealThresholdPercent
        );
        return;
    }

    ns.printf(
        "Adding additional steal, Free is %s threshold is %s",
        rollingResourceData.freePercentage,
        settings.stealThresholdPercent
    );

    LaunchScript(ns, {
        scriptName: "/mcp/steal_money/steal_targets.js",
        targetServer: "home",
        args: [],
        threads: 1,
    });

    await ns.sleep(20);

    const targets = getStealTargets(ns).filter((x) => !x.currentlyRunning);

    if (targets.length === 0) {
        ns.printf("No more targets left to steal from");
    }

    LaunchScript(ns, {
        scriptName: getStealScriptName(),
        targetServer: "home",
        args: [targets[0].hostName, settings.hackPercentage.toString()],
        threads: 1,
    });
}

async function refreshPlayer(ns: NS) {
    LaunchScript(ns, {
        scriptName: "/mcp/refresh_scripts/refresh_player.js",
        targetServer: "home",
        args: [],
        threads: 1,
    });
}
