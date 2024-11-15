import * as assert from "assert";
import { URL } from "url";

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

  const spamDomainSet = new Set(spamLinkDomains);
  const visitHistory = new Set();

  async function getFinalRedirectedUrl(
    url: string,
    currentDepth: number,
  ): Promise<string | null> {
    if (currentDepth > redirectionDepth || visitHistory.has(url)) return null;
    visitHistory.add(url);

    try {
      const response = await fetch(url, { redirect: "follow" });
      const redirectedUrl = response.url;

      if (currentDepth < redirectionDepth && response.ok) {
        // 일반 요청인 경우
        const body = await response.text();
        const additionalUrls: Array<URL> = (body.match(URLPattern) || []).map(
          (u) => new URL(u),
        );

        if (additionalUrls.some((u) => spamDomainSet.has(u.hostname))) {
          return redirectedUrl;
        }
      }

      if (spamDomainSet.has(new URL(redirectedUrl).hostname)) {
        return redirectedUrl;
      }

      return await getFinalRedirectedUrl(redirectedUrl, currentDepth + 1);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const promises = urls.map((url) => getFinalRedirectedUrl(url, 0));
  const results = await Promise.all(promises);

  return results.some((url) => {
    return url !== null;
  });
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

assert.doesNotReject(
  isSpam(
    "spam spam https://moiming.page.link.exam?_imcp=1",
    ["github.com"],
    2,
  ).then((result) => {
    assert.deepEqual(result, true);
  }),
);

assert.doesNotReject(
  isSpam(
    "spam spam https://moiming.page.link.exam?_imcp=1",
    ["docs.github.com"],
    2,
  ).then((result) => {
    assert.deepEqual(result, false);
  }),
);

assert.doesNotReject(
  isSpam(
    "spam spam https://moiming.page.link.exam?_imcp=1",
    ["docs.github.com"],
    3,
  ).then((result) => {
    assert.deepEqual(result, true);
  }),
);
