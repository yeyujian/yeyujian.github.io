var Node=function(value)
{
this.value=value;
this.num=0;
this.object=null;
this.color='red';
this.x=0;
this.y=0;
this.z=-100;
this.fa=null;
this.left=null;
this.right=null;
this.initPos=function(x1,y1,z1)
{
this.x=x1;
this.y=y1;
this.z=z1;
if(this.color==='red')
this.object.style.backgroundColor = 'rgb(127,0,0)';
if(this.color==='black')
this.object.style.backgroundColor = 'rgb(45,17,86)';
}
}
Node.prototype.init=function(num1)
{
//console.log('init'+this.value);
this.num=num1;

var element = document.createElement( 'div' );
element.className = 'element';
this.object=element;
var number = document.createElement( 'div' );
number.className = 'symbol';
number.textContent = this.value;
element.appendChild(number);
var object = new THREE.CSS3DObject( element );
object.position.x = this.x;
object.position.y = this.y;
object.position.z = this.z;
scene.add( object );
return object;	
}

function dirt(node)
{
	let fa=node.fa;
	let x2=node.x-fa.x;
	let y2=node.y-fa.y;
	let z2=node.z-fa.z;
	return x2*x2+y2*y2+z2*z2;
}
function radi(node)
{
	let fa=node.fa;
	//let pos1={x:fa.x,y:fa.y};
	let pos1={x:node.x-fa.x , y:node.y-fa.y};
	let normal={x:fa.x+100 , y:0};
	return Math.acos((pos1.x*normal.x)/(normal.x*Math.sqrt(pos1.x*pos1.x+pos1.y*pos1.y)) );
}
var RBTree=function()
{	this.objects=[];
	this.depth=0;
	this.root=null;
	this.value=0;
	this.find_value=0;
	this.lines=[];
	this.oldvalue=-1;
	this.cur=null;
	this.add=function()
	{  if(this.oldvalue===this.value) this.value++;
	   this.oldvalue=this.value;

		this.insert(new Node(this.value));
        this.depth=(this.objects.length+1)/2+1;
	    this.root.initPos(0,30,-100);
	    for(let i=0;i<this.lines.length;i++)
	    scene.remove(this.lines[i]);
	    let lines=document.getElementsByClassName('bian');

	    for(let i=0;i<lines.length;i++)
	    	document.body.removeChild(lines[i]);
	    this.lines.splice(0,this.lines.length);//清空数组
	    this.changePos(this.root,0);

	    render();
	}
}

RBTree.prototype.find=function()
{
	let f1=this.find_value;
	let cur=this.root;
	while(cur&&cur.value!==f1)
	{
		if(f1<cur.value) cur=cur.left;
		else if(f1>cur.value) cur=cur.right;
	}
if(cur)
{	

if(this.cur) 
this.cur.object.style.boxShadow='0px 0px 5px rgba(0,255,255,0.5)';
cur.object.style.boxShadow='0px 0px 70px rgba(0,255,255,0.75)';
this.cur=cur;
}
	else
	{
		alert('no this');
	}
}
RBTree.prototype.changePos=function(node,dep)
{  
try
{
 // console.log('value:'+node.value+'\n');
	//return;

// this.objects[node.num].position.x=node.x;
// this.objects[node.num].position.y=node.y;
// this.objects[node.num].position.z=node.z;
new TWEEN.Tween( this.objects[node.num].position )
.to( { x: node.x, y: node.y, z: node.z },1000)
.easing( TWEEN.Easing.Exponential.InOut ).onUpdate( render )
.start();
var cur=this.depth-dep>0?this.depth-dep:1;
// console.log(node.x);
// console.log(node.y);
// console.log(node.z);
if(node.fa)
{
var element = document.createElement( 'div' );
element.className = 'bian';
let distance=Math.round(Math.sqrt(dirt(node))-50);
element.style.width=distance+'px';
let object = new THREE.CSS3DObject( element );
// object.position.x = (node.fa.x+node.x)/2;
// object.position.y = (node.fa.y+node.y)/2;
object.position.z = node.z;
// object.rotation.z-=radi(node);
scene.add( object );
new TWEEN.Tween( object.position )
.to( { x: (node.fa.x+node.x)/2,y:(node.fa.y+node.y)/2 },1000)
.easing( TWEEN.Easing.Exponential.InOut ).onUpdate( render )
.start();
new TWEEN.Tween( object.rotation )
.to( { z:-radi(node) },1000)
.easing( TWEEN.Easing.Exponential.InOut ).onUpdate( render )
.start();
// console.log(distance+'\n'+object.position.x+'\n'+object.position.y+'\n'
// 	+object.position.z);
this.lines.push(object);

}//创建边
if(node.left)
{
// console.log('left value :'+node.left.value);
node.left.initPos(node.x-50*cur,node.y-100,node.z);
this.changePos(node.left,dep+1);
}
if(node.right)
{
// console.log('right value :'+node.right.value);
node.right.initPos(node.x+50*cur,node.y-100,node.z);
this.changePos(node.right,dep+1);
}
}//try
catch(err)
{
	console.log('problem in:'+node.value);
	console.log(err);
}
}
RBTree.prototype.insert=function(node)
{
	if(this.root==null)
	{
		this.root=node;
	}
	else
	{
		let cur=this.root;
		while(cur[node.value <= cur.value ? 'left' : 'right'])
		{
			cur = cur[node.value <= cur.value ? 'left' : 'right'];
		}
		cur[node.value <= cur.value ? 'left' : 'right'] = node;
 		node.fa = cur;
	}
	let obj=node.init(this.objects.length);
			
	this.objects.push(obj);
 	this.Fixtree(node);

}

RBTree.prototype.Fixtree=function(node)
{
	 
	 while (node.fa && node.fa.color !== 'black') 
	 {

	 let father = node.fa;
	 let grand = father.fa;
	 if(!grand) break;
	 let uncle = grand[grand.left === father ? 'right' : 'left'];
	 if (!uncle || uncle.color === 'black') 
	 {

	  let directionFromFatherToNode = father.left === node ? 'left' : 'right'
	  let directionFromGrandToFather = grand.left === father? 'left' : 'right'
	  if (directionFromFatherToNode === directionFromGrandToFather) 
	  {

	  this.rotate(father)

	  father.color = 'black';
	  grand.color = 'red';
	  node=father;
 	  } 
	  else 
	  {

	  this.rotate(node);
	  this.rotate(node);

	  node.color = 'black';
	  grand.color = 'red';
	  }

	 } 
	 else 
	 {

	  grand.color = 'red';
	  father.color = 'black';
	  uncle.color = 'black';

	  node = grand;
	 }
	 }

	 if (!node.fa) 
	 {

	 if(!node.left&&!node.right)
	 node.color = 'black';
	 this.root = node;
	 }	 

}
RBTree.prototype.rotate=function(node)
{	

	 let y = node.fa;
	 if(!y) return;
	 if (y.right == node) 
	 {
	 if(y.fa) 
	 {
	  y.fa[y.fa.left == y ? 'left' : 'right'] = node;
	  node.fa = y.fa;
	 }
	 else node.fa=null;
	 if (node.left) 
	 {
	  node.left.fa = y;
	 }
	 y.right = node.left;
	 node.left = y;
	 y.fa = node;
	 // if(node.value==1&&node.right.value==2&&node.left.value==0) console.log('2222');
	 return;
	 } 
	 else 
	 {
	 if (y.fa) 
	 {
	  y.fa[y.fa.left === y ? 'left' : 'right'] = node;
	 }
	 node.fa = y.fa;
	 if (node.right) {
	  node.right.fa = y;
	 }
	 y.left = node.right;
	 node.right = y;
	 y.fa = node;

	 }

}
