#!/usr/bin/env python3
"""GC UI SurfaceFlinger presentation-pacing probe; NOT a GPU/energy meter."""
from __future__ import annotations
import argparse
import json
import re
import statistics
import subprocess
import time
import uuid
from pathlib import Path

PKG="com.goreecloud.gcui.preview"
ACTIVITY=PKG+"/.GCNativeActivity"
PREFIX=PKG+"/"+PKG+".GCNativeActivity#"

def adb(serial,*parts,timeout=35):
    result=subprocess.run(["adb","-s",serial,*parts],capture_output=True,text=True,timeout=timeout)
    if result.returncode:
        raise RuntimeError("ADB "+ " ".join(parts)+": "+result.stderr[-250:])
    return result.stdout

def gc_layer(listing):
    # The leaf drawable is serialized directly after "RequestedLayerState{".
    # Parent container windows have an intervening hexadecimal token and
    # always produce empty SurfaceFlinger presentation history.
    direct=re.findall(r"RequestedLayerState\{"+"("+re.escape(PREFIX)+r"\d+)",listing)
    if not direct:raise ValueError("No drawable GC UI layer")
    return direct[-1]

def presentation_stats(output):
    lines=[x.strip() for x in output.splitlines() if x.strip()]
    if not lines or not lines[0].isdigit():raise ValueError("Missing vsync period")
    period=int(lines[0])
    if not 4_000_000<=period<=100_000_000:raise ValueError("Invalid vsync period")
    actual=[]
    for line in lines[1:]:
        columns=line.split()
        if len(columns)!=3:continue
        try:desired,presented,ready=map(int,columns)
        except ValueError:continue
        if min(desired,presented,ready)<=0 or max(desired,presented,ready)>=9223372036854775807:continue
        if actual and presented<=actual[-1]:continue
        actual.append(presented)
    if len(actual)<3:raise ValueError("Insufficient presented frames")
    deltas=sorted((y-x)/1e6 for x,y in zip(actual,actual[1:]))
    def p(q):return round(deltas[min(len(deltas)-1,max(0,int(len(deltas)*q+0.999999)-1))],2)
    return {
      "display_vsync_ms":round(period/1e6,3),
      "presented_frames":len(actual),
      "presentation_interval_median_ms":round(statistics.median(deltas),2),
      "presentation_interval_p90_ms":p(.9),
      "presentation_interval_p95_ms":p(.95),
      "intervals_over_1_5_vsync_pct":round(100*sum(v>1.5*period/1e6 for v in deltas)/len(deltas),2)
    }

def verified_mode(log,marker,mode):
    lines=log.splitlines()
    start=next((i for i in range(len(lines)-1,-1,-1) if marker in lines[i]),-1)
    if start<0:return False
    for line in reversed(lines[start+1:]):
        match=re.search(r'resourceMode="?(normal|conserve)"?',line)
        if match:return match.group(1)==mode
    return False

def run(serial,mode,swipes,w,h):
    adb(serial,"shell","am","force-stop",PKG)
    marker="gcui-surface-"+uuid.uuid4().hex
    adb(serial,"shell","log","-p","i","-t","GCUI.QA",marker)
    adb(serial,"shell","am","start","-W","-n",ACTIVITY,"--es","gcui_preview_mode",mode)
    time.sleep(2.0)
    log=adb(serial,"logcat","-d","-s","GCUI.QA:I","GCUI.Perf:I","*:S")
    if not verified_mode(log,marker,mode):raise RuntimeError("Mode readback failed: "+mode)
    layer=gc_layer(adb(serial,"shell","dumpsys","SurfaceFlinger","--list"))
    adb(serial,"shell","dumpsys","SurfaceFlinger","--latency-clear",layer)
    for i in range(swipes):
        y1,y2=(int(h*.77),int(h*.32)) if i%2==0 else (int(h*.32),int(h*.77))
        adb(serial,"shell","input","swipe",str(w//2),str(y1),str(w//2),str(y2),"340")
        time.sleep(.2)
    raw=adb(serial,"shell","dumpsys","SurfaceFlinger","--latency",layer)
    return {"mode":mode,"mode_verified":True,"surface_presentation":presentation_stats(raw)}

def summarize(runs):
    result={}
    for mode in ("normal","conserve"):
        rows=[r["surface_presentation"] for r in runs if r["mode"]==mode]
        result[mode]={"runs":len(rows)}
        for key in ("presented_frames","presentation_interval_median_ms","presentation_interval_p90_ms","intervals_over_1_5_vsync_pct"):
            result[mode][key+"_median"]=round(statistics.median(v[key] for v in rows),2) if rows else None
    return result

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--serial",required=True)
    ap.add_argument("--blocks",type=int,default=1)
    ap.add_argument("--swipes",type=int,default=6)
    ap.add_argument("--output",type=Path,default=Path("/tmp/gc-ui-compositor-presentation.json"))
    args=ap.parse_args()
    if not 1<=args.blocks<=3 or not 2<=args.swipes<=10:ap.error("Use 1-3 blocks, 2-10 swipes")
    if adb(args.serial,"get-state").strip()!="device":raise RuntimeError("Device not ready")
    wm=adb(args.serial,"shell","wm","size")
    dims=re.search(r"Physical size:\s*(\d+)x(\d+)",wm)
    if not dims:raise RuntimeError("Missing physical size")
    w,h=map(int,dims.groups())
    order=[]
    for i in range(args.blocks):
        order.extend(["normal","conserve","conserve","normal"] if i%2==0 else ["conserve","normal","normal","conserve"])
    runs=[]
    for index,mode in enumerate(order,1):
        print("Layer presentation run",index,"of",len(order),mode,flush=True)
        sample=run(args.serial,mode,args.swipes,w,h)
        runs.append(sample)
        print(sample["surface_presentation"],flush=True)
    data={
        "schema":"gc-ui-android-surface-presentation.v1",
        "context":{"model":adb(args.serial,"shell","getprop","ro.product.model").strip(),
                   "android_api":adb(args.serial,"shell","getprop","ro.build.version.sdk").strip(),
                   "physical_resolution":str(w)+"x"+str(h),"device_settings_changed":False,
                   "limits":"Only per-layer SurfaceFlinger presentation intervals; not GPU time, energy, end-to-end responsiveness or statistically established savings."},
        "order":order,"swipes":args.swipes,"runs":runs,"summary":summarize(runs)
    }
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(data,indent=2)+"\n")
    print("Report",args.output,flush=True)

if __name__=="__main__":main()
