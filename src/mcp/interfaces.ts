import { Server } from "/../NetscriptDefinitions";

export interface RunParameters {
    scriptName: string;
    targetServer: string;
    threads: number;
    args: string[];
}

export interface ExtendedServer extends Server {
    cctFiles: string[];
    parentServers: string[];
}

export interface RollingResource {
    rollingMax: number;
    rollingInUse: number;
    rollingFree: number;
    freePercentage: number;
}

export interface StealTarget {
    hostName: string;
    totalStealTime: number;
    currentlyRunning: boolean;
}

export interface McpSettings {
    runResourceMonitor: boolean;
    stealThresholdPercent: number; // Percentage of average free memory available before launching another steal script.
    hackPercentage: number; //Percentage of funds to take during hack
}
