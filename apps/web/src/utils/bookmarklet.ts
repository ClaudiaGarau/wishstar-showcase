const QUICK_ADD_URL = "https://claudiagarau.github.io/wishstar/quick-add";

/**
 * Runs inside the product page's own tab (added as a browser bookmark), not
 * as part of WishStar's bundle — so it can't share code with the rest of
 * the app and has to stay a small, self-contained script. It reads
 * whatever the page has already rendered for a real visitor (title, og:image,
 * a price-looking string in the visible text) then hands off to /quick-add,
 * which reuses marketplaceService.importFromUrl exactly like the in-app
 * paste-a-link flow. This is what makes stores that block server-side
 * fetching (Temu, sometimes Amazon) work at all: the request never leaves
 * the user's own browser, so there's nothing for those sites to block.
 */
function bookmarkletSource(): string {
  return `(function(){
var h1=document.querySelector('h1');
var t=(h1&&h1.innerText.trim())||(document.querySelector('meta[property="og:title"]')||{}).content||document.title||"";
var img=(document.querySelector('meta[property="og:image"]')||{}).content||"";
var body=document.body?document.body.innerText:"";
var dec=/\\u20ac\\s?\\d{1,3}(?:[.,]\\d{3})*[.,]\\d{2}|\\d{1,3}(?:[.,]\\d{3})*[.,]\\d{2}\\s?\\u20ac|\\d{1,3}(?:[.,]\\d{3})*[.,]\\d{2}\\s?(?:EUR|USD|GBP)\\b|\\b(?:EUR|USD|GBP)\\s?\\d{1,3}(?:[.,]\\d{3})*[.,]\\d{2}/i;
var whole=/\\u20ac\\s?\\d{1,3}(?:[.,]\\d{3})*|\\d{1,3}(?:[.,]\\d{3})*\\s?\\u20ac|\\d{1,3}(?:[.,]\\d{3})*\\s?(?:EUR|USD|GBP)\\b|\\b(?:EUR|USD|GBP)\\s?\\d{1,3}(?:[.,]\\d{3})*/i;
var m=body.match(dec)||body.match(whole);
var price=m?m[0]:"";
var text=(price?("Prezzo: "+price):"")+(img?("\\n"+img):"");
location.href="${QUICK_ADD_URL}?url="+encodeURIComponent(location.href)+"&title="+encodeURIComponent(t)+"&text="+encodeURIComponent(text);
})();`;
}

export function getBookmarkletHref(): string {
  return `javascript:${bookmarkletSource().replace(/\s+/gu, " ").trim()}`;
}
