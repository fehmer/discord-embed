class ContentHandler {
  constructor(content) {
    this.content = content;
  }
  element(element) {
    element.setAttribute("content", this.content);
  }
}

const prefix = "/profile/";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch(request);
  const { pathname, searchParams } = new URL(request.url);
  const nameOrUid = pathname.substring(prefix.length);
  const isUid = searchParams.get("isUid") === "true" || searchParams.get("isUid") === "";

  let rewriter = new HTMLRewriter();
  if (!isUid) {
    const title = `${nameOrUid}'s profile on monkeytype.com`;
    rewriter = rewriter
      .on('meta[property="og:title"]', new ContentHandler(title))
      .on('meta[name="twitter:title"]', new ContentHandler(title));
  }
  const image = `https://profiles.knutfischer.com/api/${nameOrUid}.png${isUid?"?isUid=true":""}`;
  rewriter = rewriter
    .on('meta[property="og:image"]', new ContentHandler(image))
    .on('meta[name="twitter:image:src"]', new ContentHandler(image));

  return rewriter.transform(response);
}
