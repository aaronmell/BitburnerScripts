import { RunParameters } from "/mcp/interfaces";

/** @param {NS} ns */
export async function main(ns: NS) {
    const runParametersJson = ns.args[0] as string;
    const runParameters = JSON.parse(runParametersJson) as RunParameters;

    if (
        ns.isRunning(
            runParameters.scriptName,
            runParameters.targetServer,
            ...runParameters.args
        )
    ) {
        ns.kill(
            runParameters.scriptName,
            runParameters.targetServer,
            ...runParameters.args
        );
    }

    ns.exec(
        runParameters.scriptName,
        runParameters.targetServer,
        runParameters.threads,
        ...runParameters.args
    );
}
