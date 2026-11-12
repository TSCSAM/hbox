import { describe, expect, it } from "vitest";
import { resolveDefaultEmbeddedSearchBackend } from "../src/app/embedded-search-backend.js";

describe("resolveDefaultEmbeddedSearchBackend", () => {
  it("uses bundled bfs, ugrep, and ripgrep paths by default", () => {
    expect(
      resolveDefaultEmbeddedSearchBackend({
        env: {
          HBOX_BFS_BINARY: "/opt/hbox/tools/bfs/bfs",
          HBOX_RG_BINARY: "/opt/hbox/tools/ripgrep/rg",
          HBOX_UGREP_BINARY: "/opt/hbox/tools/ugrep/ugrep",
        },
      }),
    ).toEqual({
      kind: "native-binaries",
      findCommand: "/opt/hbox/tools/bfs/bfs",
      grepCommand: "/opt/hbox/tools/ugrep/ugrep",
      rgCommand: "/opt/hbox/tools/ripgrep/rg",
    });
  });

  it("falls back to bfs, ugrep, and rg command names when bundled paths are unavailable", () => {
    expect(resolveDefaultEmbeddedSearchBackend({ env: {} })).toEqual({
      kind: "native-binaries",
      findCommand: "bfs",
      grepCommand: "ugrep",
      rgCommand: "rg",
    });
  });

  it("preserves the explicit internal CLI compatibility override", () => {
    expect(
      resolveDefaultEmbeddedSearchBackend({
        env: { HBOX_EMBEDDED_SEARCH_COMMAND: "/tmp/hbox-test" },
      }),
    ).toEqual({
      kind: "internal-cli",
      command: "/tmp/hbox-test",
      args: ["__internal-search"],
    });
  });
});
