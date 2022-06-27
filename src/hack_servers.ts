import { ExtendedServer, getServerData } from "./shared";

/** @param {NS} ns */
export async function main(ns: NS) {
  const serverMap = getServerData(ns);

  while (true) {
    for (const [serverName, serverObject] of Object.entries(serverMap)) {
      ns.printf("Attempting to hack %s", serverName);

      if (serverName.startsWith("pserv")) {
        delete serverMap[serverName];
        continue;
      }

      const hacked = hackServer(ns, serverName, serverObject);

      if (hacked) {
        delete serverMap[serverName];
      }
    }

    ns.exec("copy_files.js", "home", 1);
    ns.exec("gen_server_list.js", "home", 1);

    if (Object.keys(serverMap).length === 0) {
      ns.print("All Servers Hacked. Exiting");
      ns.exit();
    }

    ns.print("Unable to hack everything, sleeping");
    await ns.sleep(60000);
  }
}

/** @param {NS} ns */
function hackServer(ns: NS, serverName: string, serverObject: ExtendedServer) {
  if (ns.hasRootAccess(serverName)) {
    ns.printf("%s already hacked", serverName);
    return true;
  }

  if (!serverObject.sqlPortOpen) {
    if (!ns.fileExists("SQLInject.exe")) {
      ns.printf("SQLInject not created yet skipping server %s", serverName);
      return false;
    }
    ns.sqlinject(serverName);
  }

  if (!serverObject.httpPortOpen) {
    if (!ns.fileExists("HTTPWorm.exe")) {
      ns.printf("HTTPWorm not created yet skipping server %s", serverName);

      return false;
    }
    ns.httpworm(serverName);
  }

  if (!serverObject.smtpPortOpen) {
    if (!ns.fileExists("relaySMTP.exe")) {
      ns.printf("relaySMTP not created yet skipping server %s", serverName);

      return false;
    }
    ns.relaysmtp(serverName);
  }

  if (!serverObject.ftpPortOpen) {
    if (!ns.fileExists("FTPCrack.exe")) {
      ns.printf("FTPCrack not created yet skipping server %s", serverName);
      return false;
    }
    ns.ftpcrack(serverName);
  }

  if (!serverObject.sshPortOpen) {
    if (!ns.fileExists("BruteSSH.exe")) {
      ns.printf("BruteSSH not created yet skipping server %s", serverName);
      return false;
    }
    ns.brutessh(serverName);
  }

  ns.nuke(serverName);
  ns.printf("%s has been hacked", serverName);
  return true;
}
