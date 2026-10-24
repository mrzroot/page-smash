/* shared helpers for the per-project identity scripts (no dependencies) */
(function(){'use strict';
var d=document,R=d.documentElement;
var FX=window.FX={
 reduce:!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches),
 $:function(s,c){return(c||d).querySelector(s)},
 $$:function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))},
 mouse:{x:-1e3,y:-1e3,px:.5,py:.5},
 /* add .rv and reveal on scroll */
 reveal:function(sel,cls){cls=cls||'in';var els=FX.$$(sel);els.forEach(function(e){e.classList.add('rv')});
  if(FX.reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add(cls)});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add(cls);io.unobserve(x.target)}})},{rootMargin:'0px 0px -6% 0px'});els.forEach(function(e,i){e.style.setProperty('--i',i%6);io.observe(e)})},
 /* canvas loop: sizes to its box, pauses offscreen / hidden tab; draw(ctx,w,h,t,dt,m) with m = mouse in canvas px */
 loop:function(cv,draw,o){o=o||{};var ctx=cv.getContext('2d'),w=0,h=0,dpr=1,raf=0,on=false,vis=true,last=0,t0=performance.now(),m={x:-1e3,y:-1e3,in:false};
  function size(){var r=cv.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(o.dpr||2,window.devicePixelRatio||1);cv.width=Math.max(1,Math.round(w*dpr));cv.height=Math.max(1,Math.round(h*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);if(o.resize)o.resize(w,h)}
  function fr(now){if(!on)return;var t=(now-t0)/1000,dt=Math.min(.05,(now-last)/1000||.016);last=now;ctx.setTransform(dpr,0,0,dpr,0,0);draw(ctx,w,h,t,dt,m);raf=requestAnimationFrame(fr)}
  function go(){if(on||FX.reduce||d.hidden||!vis)return;on=true;last=performance.now();raf=requestAnimationFrame(fr)}
  function stop(){on=false;cancelAnimationFrame(raf)}
  size();addEventListener('resize',function(){size();if(!on){ctx.setTransform(dpr,0,0,dpr,0,0);draw(ctx,w,h,0,0,m)}});
  var host=o.host||cv.parentElement;host.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();m.x=e.clientX-r.left;m.y=e.clientY-r.top;m.in=true},{passive:true});host.addEventListener('pointerleave',function(){m.in=false;m.x=m.y=-1e3});
  if(FX.reduce){draw(ctx,w,h,o.still||2,0,m)}else{
   if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;vis?go():stop()},{threshold:0}).observe(cv);else go();
   d.addEventListener('visibilitychange',function(){d.hidden?stop():go()});draw(ctx,w,h,0,0,m)}
  return{size:size,draw:function(){draw(ctx,w,h,(performance.now()-t0)/1000,0,m)},ctx:ctx};},
 /* create an absolutely positioned canvas as the first child of host */
 layer:function(host,cls){var cv=d.createElement('canvas');cv.className='fx '+(cls||'');cv.setAttribute('aria-hidden','true');cv.setAttribute('role','presentation');if(getComputedStyle(host).position==='static')host.style.position='relative';host.insertBefore(cv,host.firstChild);return cv},
 css:function(n){return getComputedStyle(R).getPropertyValue(n).trim()},
 rnd:function(a,b){return a+Math.random()*(b-a)},
 theme:function(){return R.getAttribute('data-theme')==='dark'?'dark':'light'}
};
addEventListener('pointermove',function(e){FX.mouse.x=e.clientX;FX.mouse.y=e.clientY;FX.mouse.px=e.clientX/innerWidth;FX.mouse.py=e.clientY/innerHeight},{passive:true});
R.classList.add('fxjs');
})();

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
