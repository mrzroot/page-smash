(function(){var hero=FX.$('.hero');if(!hero)return;var cv=FX.layer(hero),C=[],D=[],auto=0;
function ink(){return getComputedStyle(document.documentElement).getPropertyValue('--stroke').trim()||'#111'}
function crack(x,y,w,h){var segs=[],n=7+(Math.random()*4|0);for(var i=0;i<n;i++){var a=i/n*6.283+Math.random()*.5,len=FX.rnd(60,Math.min(260,w*.4)),pts=[[x,y]],px=x,py=y,steps=4+(Math.random()*3|0);for(var k=0;k<steps;k++){a+=FX.rnd(-.5,.5);px+=Math.cos(a)*len/steps;py+=Math.sin(a)*len/steps;pts.push([px,py])}segs.push(pts)}
 C.push({x:x,y:y,segs:segs,born:0,age:0});if(C.length>5)C.shift();
 for(i=0;i<16;i++){var q=Math.random()*6.283,s=FX.rnd(120,380);D.push({x:x,y:y,vx:Math.cos(q)*s,vy:Math.sin(q)*s-200,r:Math.random()*6,vr:FX.rnd(-8,8),z:FX.rnd(6,16),l:1})}}
FX.loop(cv,function(c,w,h,t,dt,m){c.clearRect(0,0,w,h);var col=ink();auto-=dt;if(auto<=0){auto=FX.rnd(3.5,5.5);crack(FX.rnd(w*.15,w*.85),FX.rnd(h*.2,h*.7),w,h)}
 c.lineCap='round';c.lineJoin='round';
 for(var i=C.length-1;i>=0;i--){var k=C[i];k.age+=dt;if(k.age>7){C.splice(i,1);continue}var g=Math.max(0,Math.min(1,k.age*3.2)),al=k.age>5.5?1-(k.age-5.5)/1.5:1;c.globalAlpha=al;c.strokeStyle=col;
  k.segs.forEach(function(p){var tot=(p.length-1)*g;c.lineWidth=3;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(var j=1;j<p.length;j++){if(j-1>=tot)break;var f=Math.min(1,tot-(j-1));c.lineTo(p[j-1][0]+(p[j][0]-p[j-1][0])*f,p[j-1][1]+(p[j][1]-p[j-1][1])*f)}c.stroke()});
  c.lineWidth=4;c.beginPath();c.arc(k.x,k.y,Math.max(0,8*g),0,6.3);c.stroke();c.globalAlpha=1}
 for(i=D.length-1;i>=0;i--){var d=D[i];d.vy+=900*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.r+=d.vr*dt;d.l-=dt*.55;if(d.l<=0||d.y>h+30){D.splice(i,1);continue}c.save();c.translate(d.x,d.y);c.rotate(d.r);c.fillStyle='#fffdf3';c.strokeStyle=col;c.lineWidth=2.5;c.globalAlpha=Math.min(1,d.l*2);c.beginPath();c.moveTo(-d.z,-d.z*.5);c.lineTo(d.z*.8,-d.z*.3);c.lineTo(d.z*.2,d.z);c.closePath();c.fill();c.stroke();c.restore()}
 c.globalAlpha=1},{still:2});
hero.addEventListener('pointerdown',function(e){if(e.target.closest('a,button,input,code,.art,.kb,canvas.demo'))return;var b=cv.getBoundingClientRect();crack(e.clientX-b.left,e.clientY-b.top,b.width,b.height)});
FX.reveal('.kc,.rc,.dim,.box,.row,.cmd');
})();
