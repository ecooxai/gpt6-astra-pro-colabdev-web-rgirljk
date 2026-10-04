/** Authored proportion controls. Optional query values are for reproducible studio trials. */
const query=new URLSearchParams(typeof location==='undefined'?'':location.search);
function value(name,fallback,lo,hi){const raw=query.get(name),n=raw===null?fallback:Number(raw);return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;}
export const FACE_PARAMETERS=Object.freeze({
 noseLift:value('noseLift',.035,0,.085),
 mouthLift:value('mouthLift',.008,0,.055),
 jawShorten:value('jawShorten',-.028,-.055,.045),
 earLift:value('earLift',.025,0,.14),
 jawForward:value('jawForward',.18,0,.20),
 earScale:value('earScale',1.16,1,1.25),
 smileArch:value('smileArch',.010,0,.020)
});
