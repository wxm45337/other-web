var s =new Set();
[1,2,3,4,2,3].map(x=> s.add(x));
for(var i of s){
	console.log(i);
}

var a = {id:1};
var ss = new Set();
ss.add(a);
a.name=2
ss.add(a);
console.log(ss);