import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline";

// Keep in sync with apps/admin/lib/password.ts
const rl = createInterface({ input: process.stdin, output: process.stderr, terminal: true });
rl._writeToOutput = (s) => {
  if (s.includes("Password")) process.stderr.write(s);
};
rl.question("Password: ", (password) => {
  rl.close();
  process.stderr.write("\n");
  if (password.length < 12) {
    console.error("Use at least 12 characters.");
    process.exit(1);
  }
  const salt = randomBytes(16);
  scrypt(password, salt, 64, (err, hash) => {
    if (err) throw err;
    console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
  });
});
