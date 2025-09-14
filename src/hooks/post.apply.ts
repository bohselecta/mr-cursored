import { run } from "../runtime";

export default async function postApply() {
  await run("npm run fmt");
  await run("npm run lint");
}
