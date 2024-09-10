class ContentHandler {
    constructor(content) {
      this.content = content;
    }
    element(element) {
      element.setAttribute("content", this.content);
    }
  }
  
  const prefix = "/profile/";
  
  addEventListener('fetch', event => {
      event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const response = await fetch(request);
  
    const { pathname } = new URL(request.url);
  
    const username = pathname.substring(prefix.length);
    const profile = await fetchProfile(username);
  
    if(profile===undefined) return response;
  
    const lbRank = profile.allTimeLbs.time[60].english;
    const age = Math.floor((Date.now()- profile.addedAt )/ (1000 * 60 * 60 * 24));
    const timeTyping = Math.round(profile.typingStats.timeTyping/60/60);
  
    const title = `${profile.name}'s profile on monkeytype.com`;
    const description = `${profile.name} typed for ${timeTyping} hours. Highest typing speed is ${
      profile.personalBests.time[60][0].wpm
    }wpm, faster then ${Math.round(100 - (lbRank.rank / lbRank.count) * 100)}%. Joined ${age} days ago. Currently on a ${profile.streak} day streak.`;
    //const image = `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.discordAvatar}.png?size=256`;
    const image = `https://profiles.knutfischer.com/api/generated.png`;
  
    return new HTMLRewriter()
      .on('meta[property="og:description"]', new ContentHandler(description))
      .on('meta[property="og:title"]', new ContentHandler(title))
      .on('meta[name="twitter:title"]', new ContentHandler(title))
      .on('meta[property="og:image"]', new ContentHandler(image))
      .on('meta[name="twitter:image"]', new ContentHandler(image))
      .on('meta[name="profilePrefetch"]', new ContentHandler(JSON.stringify(profile)))
      .transform(response);
  }
  
  async function fetchProfile(username) {
    const url = new URL(`https://api.monkeytype.com/users/${username}/profile`);
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.data;
      
  }