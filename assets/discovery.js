export function filterItems(items, filters) {
 const words = (filters.q || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return items.filter(item => words.every(word=>item.search.toLocaleLowerCase().includes(word)) &&
  ['category','source','country','destination','eligible','status'].every(key=>!filters[key] ||
   (Array.isArray(item[key]) ? item[key].includes(filters[key]) : item[key]===filters[key])));
}
export function pageSlice(items, requested, size) {
 const total=Math.max(1,Math.ceil(items.length/size));
 const current=Math.min(total,Math.max(1,Number.isSafeInteger(requested)?requested:1));
 return {current,total,items:items.slice((current-1)*size,current*size)};
}
export function pageNumbers(total,current) {
 const visible=new Set([1,total]);
 for(let n=Math.max(1,current-2);n<=Math.min(total,current+2);n++)visible.add(n);
 const result=[];let previous=0;
 for(const n of [...visible].sort((a,b)=>a-b)){if(n-previous>1)result.push(null);result.push(n);previous=n;}
 return result;
}
export function isExpired(deadline,now=Date.now()) {
 return deadline!=='' && deadline!=null && Number.isFinite(Number(deadline)) && Number(deadline)<now;
}

// Both build records and browser indexes use epoch milliseconds here.
export function compareDeadlineTimes(first, second, now) {
  const firstExpired = isExpired(first, now);
  const secondExpired = isExpired(second, now);
  if (firstExpired !== secondExpired) {
    return firstExpired ? 1 : -1;
  }
  const firstTime = first == null ? Infinity : Number(first);
  const secondTime = second == null ? Infinity : Number(second);
  return firstTime === secondTime ? 0 : firstTime < secondTime ? -1 : 1;
}

export function sortOpportunities(items, now = Date.now()) {
  return [...items].sort((first, second) =>
    compareDeadlineTimes(first.deadline, second.deadline, now) ||
    (first.id || '').localeCompare(second.id || ''));
}
