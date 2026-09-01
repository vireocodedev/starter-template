import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function parseOsRelease(source) {
  return Object.fromEntries(
    source
      .split("\n")
      .map((line) => line.match(/^([A-Z_]+)=(?:"([^"]*)"|(.*))$/u))
      .filter(Boolean)
      .map((match) => [match[1], match[2] ?? match[3] ?? ""]),
  );
}

export function evaluateVerificationHost({
  platform,
  architecture,
  osRelease = "",
  kernelRelease = "",
  gnuTime = false,
  gnuDate = false,
}) {
  const os = parseOsRelease(osRelease);
  const wsl = /microsoft/iu.test(kernelRelease);
  const canonical =
    platform === "linux" &&
    architecture === "x64" &&
    !wsl &&
    os.ID === "ubuntu" &&
    os.VERSION_ID === "24.04";
  const toolsReady = gnuTime && gnuDate;

  if (canonical && toolsReady) {
    return {
      status: "pass",
      summary:
        "Authoritative verification host: Ubuntu 24.04 x86-64 with GNU time/date",
    };
  }
  if (canonical) {
    return {
      status: "fail",
      summary: "Ubuntu 24.04 x86-64 is missing GNU time or GNU date",
      remedy:
        "Install GNU time and coreutils before running `corepack npm run verify`.",
    };
  }

  const host = wsl
    ? "Windows/WSL2"
    : `${platform}/${architecture}${os.PRETTY_NAME ? ` (${os.PRETTY_NAME})` : ""}`;
  return {
    status: "warn",
    summary: `${host} is outside the supported local verification host`,
    remedy:
      "Use Ubuntu 24.04 x86-64 for release evidence; this host remains untested until an automated support lane exists.",
  };
}

function commandIsGnu(executable) {
  const result = spawnSync(executable, ["--version"], { encoding: "utf8" });
  return (
    result.status === 0 &&
    /GNU/iu.test(`${result.stdout ?? ""}\n${result.stderr ?? ""}`)
  );
}

export function inspectVerificationHost() {
  const readOptional = (path) =>
    existsSync(path) ? readFileSync(path, "utf8") : "";
  return evaluateVerificationHost({
    platform: process.platform,
    architecture: process.arch,
    osRelease: readOptional("/etc/os-release"),
    kernelRelease: readOptional("/proc/sys/kernel/osrelease"),
    gnuTime: commandIsGnu("/usr/bin/time"),
    gnuDate: commandIsGnu("date"),
  });
}
