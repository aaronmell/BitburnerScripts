import { RunParameters } from "mcp/intefaces";
import { LaunchScript } from "mcp/utils";

/** @param {NS} ns */
export async function main(ns: NS) {
    const settingsPath = (
        ns.args[0] ? ns.args[0] : "/mcp/defaultSettings.json.txt"
    ) as string;

    const settings = loadSettings(ns, settingsPath);
    let count = 0;

    loadPersistentScripts(ns, settings);

    while (true) {
        count = count++;
        controllerLoop(ns, count, settings);
        await ns.sleep(1000);
    }
}

function loadSettings(ns: NS, settingsPath: string): McpSettings {
    const serverString = ns.read(settingsPath);
    return JSON.parse(serverString);
}

interface McpSettings {
    runResourceMonitor: boolean;
}

function controllerLoop(ns: NS, count: number, settings: McpSettings) {}

function loadPersistentScripts(ns: NS, settings: McpSettings) {
    if (settings.runResourceMonitor) {
        const runParameters: RunParameters = {
            scriptName: "/mcp/resource_monitor.js",
            targetServer: "home",
            args: [],
            threads: 1,
        };

        LaunchScript(ns, runParameters);
    }
}
