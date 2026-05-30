"use client";

import { useState } from "react";
import ToolHeader from "@/components/ui/ToolHeader";
import { Key } from "lucide-react";

type TabId = "base64" | "url" | "hash" | "jwt";

const TABS: { id: TabId; label: string }[] = [
  { id: "base64", label: "Base64" },
  { id: "url",    label: "URL Encode" },
  { id: "hash",   label: "Hash" },
  { id: "jwt",    label: "JWT Decode" },
];

async function sha(input: string, algo: "SHA-256" | "SHA-512"): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function decodeJWT(token: string): { header: object; payload: object } | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length < 2) return null;
    const decode = (s: string) =>
      JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/")));
    return { header: decode(parts[0]), payload: decode(parts[1]) };
  } catch {
    return null;
  }
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-border">
      <td className="px-3 py-2 text-muted-foreground align-top w-28">{label}</td>
      <td className="px-3 py-2 text-foreground break-all">{value}</td>
    </tr>
  );
}

function JsonPanel({ title, data }: { title: string; data: object }) {
  return (
    <div className="flex flex-col p-4 gap-2 bg-card border border-border">
      <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">{title}</span>
      <pre className="text-[12px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function EncodeHashPage() {
  const [tab, setTab] = useState<TabId>("base64");

  // Base64
  const [b64Input, setB64Input]   = useState("");
  const [b64Result, setB64Result] = useState<{ label: string; value: string } | null>(null);

  // URL
  const [urlInput, setUrlInput]   = useState("");

  // Hash
  const [hashInput, setHashInput] = useState("");
  const [hashes, setHashes]       = useState<{ sha256: string; sha512: string } | null>(null);
  const [hashing, setHashing]     = useState(false);

  // JWT
  const [jwtInput, setJwtInput]   = useState("");

  const handleB64Encode = () => {
    try { setB64Result({ label: "Encoded", value: btoa(b64Input) }); }
    catch { setB64Result({ label: "Error", value: "Input contains characters outside Latin-1 range" }); }
  };

  const handleB64Decode = () => {
    try { setB64Result({ label: "Decoded", value: atob(b64Input) }); }
    catch { setB64Result({ label: "Error", value: "Invalid Base64 string" }); }
  };

  const handleHash = async () => {
    if (!hashInput.trim()) return;
    setHashing(true);
    const [s256, s512] = await Promise.all([sha(hashInput, "SHA-256"), sha(hashInput, "SHA-512")]);
    setHashes({ sha256: s256, sha512: s512 });
    setHashing(false);
  };

  const urlEncoded = urlInput ? encodeURIComponent(urlInput) : "";
  const urlDecoded = (() => {
    try { return urlInput ? decodeURIComponent(urlInput) : ""; }
    catch { return "Invalid percent-encoded string"; }
  })();

  const jwtResult = jwtInput.trim() ? decodeJWT(jwtInput) : null;

  return (
    <div>
      <ToolHeader
        title="Encode & Hash"
        description="Base64, URL encoding, SHA-256 / SHA-512 hash generation, and JWT decode."
        icon={Key}
      />

      {/* Tab bar */}
      <div className="flex mb-5 border border-border overflow-hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[12px] tracking-[0.08em] transition-colors duration-150 border-r border-border last:border-r-0 ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Base64 */}
      {tab === "base64" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">Input</span>
            <textarea
              value={b64Input}
              onChange={(e) => setB64Input(e.target.value)}
              placeholder="Enter plain text to encode, or Base64 to decode..."
              rows={5}
              className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleB64Encode}
                className="px-4 py-2 text-[12px] bg-primary text-primary-foreground border border-primary"
              >
                Encode →
              </button>
              <button
                onClick={handleB64Decode}
                className="px-4 py-2 text-[12px] border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                ← Decode
              </button>
            </div>
          </div>

          {b64Result && (
            <div className="flex flex-col p-4 gap-2 bg-card border border-border">
              <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
                {b64Result.label}
              </span>
              <p className="text-[13px] font-mono text-foreground break-all">{b64Result.value}</p>
            </div>
          )}
        </div>
      )}

      {/* URL encode */}
      {tab === "url" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">Input</span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter a URL or percent-encoded string..."
              className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {urlInput && (
            <div className="border border-border bg-card overflow-hidden">
              <table className="w-full text-[13px]">
                <tbody className="font-mono">
                  <ResultRow label="Encoded" value={urlEncoded} />
                  <ResultRow label="Decoded" value={urlDecoded} />
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hash */}
      {tab === "hash" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">Input</span>
            <textarea
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter text to hash..."
              rows={5}
              className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
            <button
              onClick={handleHash}
              disabled={hashing || !hashInput.trim()}
              className="self-start px-4 py-2 text-[12px] bg-primary text-primary-foreground border border-primary disabled:opacity-50"
            >
              {hashing ? "Hashing..." : "Generate Hashes"}
            </button>
          </div>

          {hashes && (
            <div className="border border-border bg-card overflow-hidden">
              <table className="w-full text-[13px]">
                <tbody className="font-mono">
                  <ResultRow label="SHA-256" value={hashes.sha256} />
                  <ResultRow label="SHA-512" value={hashes.sha512} />
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* JWT */}
      {tab === "jwt" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col p-4 gap-3 bg-card border border-border">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">JWT Token</span>
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="Paste a JWT token (header.payload.signature)..."
              rows={4}
              className="px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
            <span className="text-[11px] text-amber-500">
              Signature is not verified — decode only
            </span>
          </div>

          {jwtInput.trim() && (
            jwtResult ? (
              <div className="flex flex-col gap-4">
                <JsonPanel title="Header"  data={jwtResult.header} />
                <JsonPanel title="Payload" data={jwtResult.payload} />
              </div>
            ) : (
              <div className="p-4 border border-border bg-card text-[13px] font-mono text-destructive">
                Invalid JWT — could not decode
              </div>
            )
          )}
        </div>
      )}

      {/* Examples */}
      <div className="mt-5 flex flex-col p-4 gap-3 bg-card border border-border">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">Examples</span>
        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "Base64 — plain text",
              action: () => { setTab("base64"); setB64Input("Hello, World!"); setB64Result(null); },
            },
            {
              label: "Base64 — JSON object",
              action: () => { setTab("base64"); setB64Input('{"user":"admin","role":"superuser"}'); setB64Result(null); },
            },
            {
              label: "URL — query string",
              action: () => { setTab("url"); setUrlInput("https://example.com/search?q=hello world&lang=en&page=1"); },
            },
            {
              label: "URL — encoded input",
              action: () => { setTab("url"); setUrlInput("https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world"); },
            },
            {
              label: "Hash — password",
              action: () => { setTab("hash"); setHashInput("password123"); setHashes(null); },
            },
            {
              label: "Hash — empty string",
              action: () => { setTab("hash"); setHashInput(""); setHashes(null); },
            },
            {
              label: "JWT — HS256 sample",
              action: () => {
                setTab("jwt");
                setJwtInput("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
              },
            },
          ].map((ex) => (
            <button
              key={ex.label}
              onClick={ex.action}
              className="px-3 py-1.5 text-[12px] font-mono border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
