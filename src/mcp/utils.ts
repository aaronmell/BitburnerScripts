import { RunParameters } from "mcp/intefaces";

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
