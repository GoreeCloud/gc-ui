/** Verify screenshot pixel content independently of zoom layout tests. */
import {inflateSync} from 'node:zlib';
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
export function inspectScreenshotPixels(png,{minChannelDelta=24}={}){
 if(!Buffer.isBuffer(png)||!png.subarray(0,8).equals(signature))
  throw new Error('Screenshot is not a PNG buffer');
 if(!Number.isFinite(minChannelDelta)||minChannelDelta<1||minChannelDelta>255)
  throw new RangeError('Invalid screenshot pixel threshold');
 let offset=8,width=0,height=0,channels=0,hasIhdr=false,ended=false;
 const idat=[];
 while(offset+12<=png.length){
  const length=png.readUInt32BE(offset),type=png.toString('ascii',offset+4,offset+8);
  if(length>png.length-offset-12)throw new Error('Truncated screenshot PNG chunk');
  const content=png.subarray(offset+8,offset+8+length);
  if(type==='IHDR'){
   if(hasIhdr||content.length!==13)throw new Error('Invalid screenshot PNG header');
   hasIhdr=true;width=content.readUInt32BE(0);height=content.readUInt32BE(4);
   channels=({0:1,2:3,4:2,6:4})[content[9]];
   if(content[8]!==8||!channels||content[10]!==0||content[11]!==0||content[12]!==0)
    throw new Error('Unsupported screenshot PNG format');
  }else if(type==='IDAT')idat.push(content);
  else if(type==='IEND'){ended=true;break}
  offset+=12+length;
 }
 if(!hasIhdr||!ended||!idat.length||!width||!height)
  throw new Error('Incomplete screenshot PNG');
 const pixels=width*height,rowBytes=width*channels;
 if(pixels>20_000_000||pixels<1||rowBytes>80_000_000)
  throw new Error('Screenshot PNG dimensions out of bounds');
 const expected=height*(rowBytes+1);
 if(expected>100_000_000)throw new Error('Screenshot PNG too large');
 const raw=inflateSync(Buffer.concat(idat),{maxOutputLength:expected+1});
 if(raw.length!==expected)throw new Error('Unexpected screenshot PNG scanline size');
 let prior=Buffer.alloc(rowBytes),current=Buffer.alloc(rowBytes),cursor=0;
 let reference=null,maxDelta=0;
 for(let y=0;y<height;y++){
  const filter=raw[cursor++];
  if(filter>4)throw new Error('Invalid screenshot PNG row filter');
  for(let i=0;i<rowBytes;i++){
   const x=raw[cursor++],a=i>=channels?current[i-channels]:0,b=prior[i];
   const c=i>=channels?prior[i-channels]:0;
   let predictor=0;
   if(filter===1)predictor=a;
   else if(filter===2)predictor=b;
   else if(filter===3)predictor=Math.floor((a+b)/2);
   else if(filter===4){
    const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
    predictor=pa<=pb&&pa<=pc?a:pb<=pc?b:c;
   }
   current[i]=(x+predictor)&255;
  }
  for(let i=0;i<rowBytes;i+=channels){
   const rgb=channels<=2?[current[i],current[i],current[i]]:[current[i],current[i+1],current[i+2]];
   if(!reference)reference=rgb;
   maxDelta=Math.max(maxDelta,Math.abs(rgb[0]-reference[0]),Math.abs(rgb[1]-reference[1]),Math.abs(rgb[2]-reference[2]));
   if(maxDelta>=minChannelDelta)return {width,height,maxDelta,hasVisibleContent:true};
  }
  [prior,current]=[current,prior];
 }
 return {width,height,maxDelta,hasVisibleContent:false};
}

export async function captureZoomScreenshot(page,options,{attempts=2,delayMs=250,validateContent=false}={}){
 if(!Number.isSafeInteger(attempts)||attempts<1||
    !Number.isFinite(delayMs)||delayMs<0||typeof validateContent!=='boolean')
  throw new RangeError('Invalid screenshot retry limits');
 let lastError;
 for(let count=1;count<=attempts;count++){
  try{
   const png=await page.screenshot(options);
   if(validateContent&&!inspectScreenshotPixels(png).hasVisibleContent)
    throw new Error('Screenshot PNG is visually uniform; capture is not accepted');
   return {captured:true,attempts:count};
  }catch(error){
   lastError=error;
   if(count<attempts)await page.waitForTimeout(delayMs);
  }
 }
 return {captured:false,attempts,error:lastError};
}
