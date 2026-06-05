export function About() {
  return (
    <div className="flex flex-col gap-2 bg-card border border-border p-4 mb-5">
      {/* Header */}
      <div className="flex items-center">
        <span className="text-[11px] uppercase text-muted-foreground">
          About Host Map
        </span>
      </div>

      {/* Remote Mode Instructions */}
      <div>
        <span className="text-[13px] text-muted-foreground">
          <b>Remote mode</b>: If accessing OSSAD-9 from the web, host map runs
          on simulated data for reasons concerning{" "}
          <a
            href="https://vercel.com/legal/acceptable-use-policy"
            style={{ color: "oklch(0.50 0.21 277.366)" }}
          >
            Vercel security
          </a>{" "}
          and{" "}
          <a
            href="https://vercel.com/docs/functions/runtimes"
            style={{ color: "oklch(0.50 0.21 277.366)" }}
          >
            Vercel's sandboxed environment
          </a>
          .
        </span>
      </div>

      {/* Local Mode Instructions */}
      <div>
        <span className="text-[13px] text-muted-foreground">
          <b>Local mode</b>: When using OSSAD-9 as a local web application,
          please ensure that you have installed{" "}
          <a
            href="https://nmap.org/download"
            style={{ color: "oklch(0.50 0.21 277.366)" }}
          >
            nmap
          </a>{" "}
          and added it to your PATH. If nmap cannot be accessed in this
          configuration, host map reverts back to running on simulated data.
          Otherwise, consider installing the OSSAD-9 desktop application which
          comes prebundled with all prerequisite binaries and requires no
          further work from your end.
        </span>
      </div>

      {/* About */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px] text-muted-foreground">
          <b>About</b>: Host Map is a network diagnostics tool that enables you
          to visualize your LAN network topology. Host map is built on top of a
          binary called nmap, which is a port scanner program. However, due to
          legal and ethical concerns, OSSAD uses it with the -sn flag, which
          reduces it to a ping sweep. i.e., only check which hosts are alive in
          a network. Crucially, Host Map is not designed nor intended to
          discover network hosts outside of your local area. Examples of
          unauthorized scans are:
        </span>

        <ul className="list-disc list-inside text-[13px] text-muted-foreground">
          <li>
            Scanning a neighbour's WiFi to map their connected devices without
            their knowledge or consent{" "}
          </li>
          <li>
            Entering your ISP management's subnet CIDR to scan their internal
            network
          </li>
          <li>
            Using a VPN to host map a remote private network without explicit
            written permission
          </li>
          <li>
            Scanning any shared public network at a public venue such as a hotel
            or airport
          </li>
        </ul>

        <span className="text-[13px] text-muted-foreground">
          Host map is exclusively designed to scan on a local network that you
          own. Examples of authorized scans include:
        </span>

        <ul className="list-disc list-inside text-[13px] text-muted-foreground">
          <li>Scanning your own home LAN to identify unknown devices</li>
          <li>
            Scanning a network that you own and operate such as your business
            network
          </li>
          <li>
            Running authorized penetration tests as a security professional with
            explicit permission granted by the network owner
          </li>
          <li>
            A network in which you have explicit written permission to scan such
            as in a security or IT contractor role
          </li>
        </ul>

        <span className="text-[13px] text-muted-foreground">
          For more information regarding the ethics and legality of (port)
          scanning, the user is highly encouraged to give a read through the
          following{" "}
          <a
            href="https://nmap.org/book/legal-issues.html"
            style={{ color: "oklch(0.50 0.21 277.366)" }}
          >
            article
          </a>{" "}
          written by the authors of nmap itself.
        </span>
      </div>
    </div>
  );
}
