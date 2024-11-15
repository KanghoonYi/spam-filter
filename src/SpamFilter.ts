import * as assert from "assert";
import { Agent as HTTPAgent } from "http";
import { Agent as HTTPSAgent } from "https";
import { URL } from "url";

import axios from "axios";
import * as http from "node:http";

const axiosInstance = axios.create({
  httpAgent: new HTTPAgent({
    keepAlive: true,
  }),
  httpsAgent: new HTTPSAgent({
    keepAlive: true,
  }),
});

const URLPattern = /https?:\/\/\S+/g;
const extractURL = (text: string): Array<string> => {
  const matchResults = text.matchAll(URLPattern);

  const results = [];
  let matchResult: IteratorResult<RegExpExecArray, undefined>;
  while ((matchResult = matchResults.next()).done === false) {
    results.push(matchResult.value[0]);
  }
  return results;
};

const isSpam = async (
  content: string,
  spamLinkDomains: string[],
  redirectionDepth: number,
): Promise<boolean> => {
  const urls = extractURL(content);

  await Promise.all(
    urls.map(async (url) => {
      const response = await axiosInstance.get(url, {
        maxRedirects: redirectionDepth,
      });

      return;
    }),
  );

  return false;
};

assert.doesNotReject(
  isSpam(
    "spam spam https://moiming.page.link.exam?_imcp=1",
    ["docs.github.com"],
    1,
  ).then((result) => {
    assert.deepEqual(result, false);
  }),
);
//
// assert.deepEqual(
//   isSpam(
//     "spam spam https://moiming.page.link.exam?_imcp=1",
//     ["moiming.page.link"],
//     1,
//   ),
//   true,
// );
//
// assert.deepEqual(
//   isSpam("spam spam https://moiming.page.link.exam?_imcp=1", ["github.com"], 2),
//   true,
// );
//
// assert.deepEqual(
//   isSpam(
//     "spam spam https://moiming.page.link.exam?_imcp=1",
//     ["docs.github.com"],
//     2,
//   ),
//   false,
// );
//
// assert.deepEqual(
//   isSpam(
//     "spam spam https://moiming.page.link.exam?_imcp=1",
//     ["docs.github.com"],
//     3,
//   ),
//   true,
// );
