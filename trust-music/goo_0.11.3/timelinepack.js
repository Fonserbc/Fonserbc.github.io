/* Goo Engine timelinepack 0.11.3
 * Copyright 2014 Goo Technologies AB
 */
(function(window){function f(){
define("goo/timelinepack/AbstractTimelineChannel",[],function(){function e(e){this.id=e,this.enabled=!0,this.keyframes=[],this.lastTime=0}return e.prototype._find=function(e,t){var n=0,r=e.length-1,i=e[e.length-1].time;if(t>i)return r;while(r-n>1){var s=Math.floor((r+n)/2),o=e[s].time;t>o?n=s:r=s}return n},e.prototype.sort=function(){return this.keyframes.sort(function(e,t){return e.time-t.time}),this.lastTime=this.keyframes[this.keyframes.length-1].time,this},e}),define("goo/timelinepack/EventChannel",["goo/timelinepack/AbstractTimelineChannel"],function(e){function t(t){e.call(this,t),this.oldTime=0,this.callbackIndex=0}return t.prototype=Object.create(e.prototype),t.prototype.constructor=e,t.prototype.addCallback=function(e,t,n){var r={id:e,time:t,callback:n};if(t>this.lastTime)this.keyframes.push(r),this.lastTime=t;else if(!this.keyframes.length||t<this.keyframes[0].time)this.keyframes.unshift(r);else{var i=this._find(this.keyframes,t)+1;this.keyframes.splice(i,0,r)}return this},t.prototype.update=function(e){if(!this.enabled)return this;if(!this.keyframes.length)return this;if(e<this.oldTime){while(this.callbackIndex<this.keyframes.length)this.keyframes[this.callbackIndex].callback(),this.callbackIndex++;this.callbackIndex=0}while(this.callbackIndex<this.keyframes.length&&e>this.keyframes[this.callbackIndex].time)this.keyframes[this.callbackIndex].callback(),this.callbackIndex++;return this.oldTime=e,this},t.prototype.setTime=function(e){return this.enabled?this.keyframes.length?(e<=this.keyframes[0].time?this.callbackIndex=0:this.callbackIndex=this._find(this.keyframes,e)+1,this.oldTime=e,this):this:this},t}),define("goo/timelinepack/TimelineComponent",["goo/entities/components/Component"],function(e){function t(){this.type="TimelineComponent",this.channels=[],this.time=0,this.duration=0,this.loop=!1}return t.prototype=Object.create(e.prototype),t.prototype.constructor=t,t.prototype.addChannel=function(e){return this.channels.push(e),this},t.prototype.update=function(e){var t=this.time+e;t>this.duration&&(this.loop?t%=this.duration:t=this.duration);if(t===this.time)return this;this.time=t;for(var n=0;n<this.channels.length;n++){var r=this.channels[n];r.update(this.time)}return this},t.prototype.setTime=function(e){this.time=e;for(var t=0;t<this.channels.length;t++){var n=this.channels[t];n.setTime(this.time)}return this},t.prototype.getValues=function(){var e={};for(var t=0;t<this.channels.length;t++){var n=this.channels[t];typeof n.value!="undefined"&&n.keyframes.length&&(e[n.id]=n.value)}return e},t}),define("goo/timelinepack/ValueChannel",["goo/timelinepack/AbstractTimelineChannel","goo/math/MathUtils"],function(e,t){function n(t,n){e.call(this,t),this.value=0,n=n||{},this.callbackUpdate=n.callbackUpdate,this.callbackEnd=n.callbackEnd}return n.prototype=Object.create(e.prototype),n.prototype.constructor=e,n.prototype.addKeyframe=function(e,t,n,r){var i={id:e,time:t,value:n,easingFunction:r};if(t>this.lastTime)this.keyframes.push(i),this.lastTime=t;else if(!this.keyframes.length||t<this.keyframes[0].time)this.keyframes.unshift(i);else{var s=this._find(this.keyframes,t)+1;this.keyframes.splice(s,0,i)}return this},n.prototype.update=function(e){if(!this.enabled)return this.value;if(!this.keyframes.length)return this.value;var n,r;if(e<=this.keyframes[0].time)n=this.keyframes[0].value;else if(e>=this.keyframes[this.keyframes.length-1].time)n=this.keyframes[this.keyframes.length-1].value;else{r=this._find(this.keyframes,e);var i=this.keyframes[r],s=this.keyframes[r+1],o=(e-i.time)/(s.time-i.time),u=i.easingFunction(o);n=t.lerp(u,i.value,s.value)}return this.value=n,this.callbackUpdate(e,this.value,r),this},n.prototype.setTime=n.prototype.update,n.getSimpleTransformTweener=function(e,t,n,r){var i;return function(s,o){i||(i=r(n)),i&&(i.transformComponent.transform[e].data[t]=o,i.transformComponent.setUpdated())}},n.getRotationTweener=function(e,n,r,i){var s,o=function(i,u){s||(s=r(n));if(s){var a=o.rotation;a[e]=u*t.DEG_TO_RAD,s.transformComponent.transform.rotation.fromAngles(a[0],a[1],a[2]),s.transformComponent.setUpdated()}};return o.rotation=i,o},n}),define("goo/timelinepack/TimelineComponentHandler",["goo/loaders/handlers/ComponentHandler","goo/timelinepack/TimelineComponent","goo/timelinepack/ValueChannel","goo/timelinepack/EventChannel","goo/util/PromiseUtil","goo/util/ArrayUtil","goo/entities/SystemBus","goo/util/ObjectUtil"],function(e,t,n,r,i,s,o,u){function f(){e.apply(this,arguments),this._type="TimelineComponent"}function l(e){if(!e)return a.Easing.Linear.None;var t=e.indexOf("."),n=e.substr(0,t),r=e.substr(t+1);return a.Easing[n][r]}function c(e,t,n){var r=!1,i=s.find(n.keyframes,function(e){return e.id===t}),o=l(e.easing);return i?(i.time!==+e.time&&(r=!0),i.time=+e.time,i.value=+e.value,i.easingFunction=o):n.addKeyframe(t,e.time,e.value,o),{needsResorting:r}}function h(e,t,n,r){var i=!1,u=s.find(n.keyframes,function(e){return e.id===t}),a=function(){o.emit(r.eventName,e.value)};return u?(u.time!==+e.time&&(i=!0),u.time=+e.time,u.callback=a):n.addCallback(t,e.time,a),{needsResorting:i}}function p(e,t,i,o,u){var a=s.find(i.channels,function(e){return e.id===t});if(!a){var l=e.propertyKey;if(l){var p=e.entityId;p&&!u[p]&&(u[p]=[0,0,0]);var d=f.tweenMap[l](p,o,u[p]);a=new n(t,{callbackUpdate:d})}else a=new r(t);i.channels.push(a)}else if(e.entityId&&a.callbackUpdate&&a.callbackUpdate.rotation){var v=u[e.entityId]=a.callbackUpdate.rotation;v[0]=0,v[1]=0,v[2]=0}a.enabled=e.enabled!==!1,a.keyframes=a.keyframes.filter(function(t){return!!e.keyframes[t.id]});var m=!1;if(e.propertyKey)for(var g in e.keyframes){var y=e.keyframes[g],b=c(y,g,a,e);m=m||b.needsResorting}else for(var g in e.keyframes){var y=e.keyframes[g],b=h(y,g,a,e);m=m||b.needsResorting}m&&a.sort()}var a=window.TWEEN;return f.prototype=Object.create(e.prototype),f.prototype.constructor=f,e._registerClass("timeline",f),f.prototype._prepare=function(){},f.prototype._create=function(){return new t},f.tweenMap={translationX:n.getSimpleTransformTweener.bind(null,"translation",0),translationY:n.getSimpleTransformTweener.bind(null,"translation",1),translationZ:n.getSimpleTransformTweener.bind(null,"translation",2),scaleX:n.getSimpleTransformTweener.bind(null,"scale",0),scaleY:n.getSimpleTransformTweener.bind(null,"scale",1),scaleZ:n.getSimpleTransformTweener.bind(null,"scale",2),rotationX:n.getRotationTweener.bind(null,0),rotationY:n.getRotationTweener.bind(null,1),rotationZ:n.getRotationTweener.bind(null,2)},f.prototype.update=function(t,n,r){var i=this;return e.prototype.update.call(this,t,n,r).then(function(e){if(!e)return;isNaN(n.duration)||(e.duration=+n.duration),e.loop=n.loop.enabled===!0,e.channels=e.channels.filter(function(e){return!!n.channels[e.id]});var t=function(e){return i.world.entityManager.getEntityById(e)},r={};return u.forEach(n.channels,function(n){p(n,n.id,e,t,r)},null,"sortValue"),e})},f}),define("goo/timelinepack/TimelineSystem",["goo/entities/systems/System"],function(e){function t(){e.call(this,"TimelineSystem",["TimelineComponent"])}return t.prototype=Object.create(e.prototype),t.prototype.constructor=t,t.prototype.process=function(e,t){if(this.resetRequest){var n;this.resetRequest=!1;for(var r=0;r<e.length;r++)n=e[r].timelineComponent,n.setTime(0);this.time=0,window.TWEEN&&window.TWEEN.removeAll(),this.passive=!0;return}for(var r=0;r<this._activeEntities.length;r++){var i=this._activeEntities[r];i.timelineComponent.update(t)}},t.prototype.pause=function(){this.passive=!0,this.paused=!0},t.prototype.play=function(){this.passive=!1,this.paused||(this.entered=!0),this.paused=!1},t.prototype.reset=function(){this.passive=!1,this.resetRequest=!0,this.paused=!1},t}),require(["goo/timelinepack/AbstractTimelineChannel","goo/timelinepack/EventChannel","goo/timelinepack/TimelineComponent","goo/timelinepack/TimelineComponentHandler","goo/timelinepack/TimelineSystem","goo/timelinepack/ValueChannel"],function(e,t,n,r,i,s){var o=window.goo;if(!o)return;o.AbstractTimelineChannel=e,o.EventChannel=t,o.TimelineComponent=n,o.TimelineComponentHandler=r,o.TimelineSystem=i,o.ValueChannel=s}),define("goo/timelinepack/timelinepack",function(){});
}try{
if(window.localStorage&&window.localStorage.gooPath){
window.require.config({
paths:{goo:localStorage.gooPath}
});
}else f()
}catch(e){f()}
})(window)