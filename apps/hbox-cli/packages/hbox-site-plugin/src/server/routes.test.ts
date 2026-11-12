import { describe, expect, it } from "vitest";
import { resourcePath } from "./routes.ts";

const SITE = "1978123456789012480";
const DEP = "1978123456789012481";

describe("resourcePath", () => {
  it.each([
    ["hbox-site://usage", "/api/v1/sites/usage"],
    ["hbox-site://plans", "/api/v1/sites/plans"],
    ["hbox-site://sites", "/api/v1/sites"],
    ["hbox-site://sites?cursor=", "/api/v1/sites"],
    ["hbox-site://sites?cursor=a%2Fb&limit=20", "/api/v1/sites?cursor=a%2Fb&limit=20"],
    [`hbox-site://sites/${SITE}`, `/api/v1/sites/${SITE}`],
    [
      `hbox-site://sites/${SITE}/deployments?cursor=x`,
      `/api/v1/sites/${SITE}/deployments?cursor=x`,
    ],
    [`hbox-site://sites/${SITE}/deployments/${DEP}`, `/api/v1/sites/${SITE}/deployments/${DEP}`],
    [`hbox-site://sites/${SITE}/cover`, `/api/v1/sites/${SITE}/cover`],
    [
      `hbox-site://sites/${SITE}/deployments/${DEP}/logs?offset=12`,
      `/api/v1/sites/${SITE}/deployments/${DEP}/logs?offset=12`,
    ],
  ])("maps %s", (uri, path) => {
    expect(resourcePath(uri)).toBe(path);
  });

  it.each([
    "hbox-site://other",
    "https://sites/1",
    "hbox-site://usage?cursor=1",
    "hbox-site://plans?limit=1",
    "hbox-site://plans/free",
    "hbox-site://sites/abc",
    "hbox-site://sites/0123",
    "hbox-site://sites/1/deployments/2/logs/extra",
    "hbox-site://sites/1/cover/2",
    "hbox-site://sites/1/cover?offset=1",
    "hbox-site://sites/1/settings",
    "hbox-site://sites/1/deployments/2/logs?offset=-1",
    "hbox-site://sites?limit=1e3",
    "hbox-site://sites?cursor=a&cursor=b",
    "hbox-site://sites/1/deployments/2?offset=1",
    "hbox-site://user@sites",
    "hbox-site://sites/..%2Fusage",
    "not a uri",
  ])("rejects %s", (uri) => {
    expect(resourcePath(uri)).toBeUndefined();
  });
});
