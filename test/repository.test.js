const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

test("repository contains one Outlook product", () => {
  assert.equal(fs.existsSync("extension"), false);
  assert.equal(
    execFileSync("git", ["ls-files", "node_modules"], { encoding: "utf8" }).trim(),
    "",
  );
  const manifest = fs.readFileSync("manifest.xml", "utf8");
  assert.match(manifest, /MessageReadCommandSurface/);
  assert.match(manifest, /https:\/\/localhost:5051\/taskpane\.html/);
  assert.match(manifest, /ReadItem/);
  assert.doesNotMatch(manifest, /Gmail/i);
});
