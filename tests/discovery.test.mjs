import test from 'node:test';
import assert from 'node:assert/strict';
import {filterItems,pageSlice,pageNumbers,isExpired} from '../assets/discovery.js';

test('search and combined filters find records beyond the first page',()=>{
 const items=Array.from({length:65},(_,n)=>({search:`Scholarship ${n}`,country:n===64?'DE':'US',destination:['FR'],eligible:['TR'],source:'publisher',category:['scholarships']}));
 const matching=filterItems(items,{q:'scholarship 64',country:'DE',destination:'FR',eligible:'TR',source:'publisher',category:'scholarships'});
 assert.equal(matching.length,1);assert.equal(pageSlice(matching,1,30).items[0],items[64]);
 assert.equal(filterItems(items,{country:'FR',destination:'DE'}).length,0);
 assert.equal(filterItems(items,{q:'  SCHOLARSHIP   64 '}).length,1);
});
test('pagination handles changing result counts and long page ranges',()=>{
 assert.deepEqual(pageSlice([],99,30),{current:1,total:1,items:[]});
 assert.equal(pageSlice(Array(65),99,30).current,3);
 assert.equal(pageSlice(Array(65),-1,30).current,1);
 assert.deepEqual(pageNumbers(20,10),[1,null,8,9,10,11,12,null,20]);
 assert.deepEqual(pageNumbers(1,1),[1]);
});
test('expiration uses the clock and never marks unknown deadlines expired',()=>{
 assert.equal(isExpired('100',99),false);assert.equal(isExpired('100',101),true);
 for(const value of ['',null,undefined,'bad','Infinity'])assert.equal(isExpired(value,1000),false);
});
