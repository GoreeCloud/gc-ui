#!/usr/bin/env python3
"""Collect GC UI Activity HWUI GPU histogram samples, not full WebView compositor GPU work.

Uses the debug-only resource-mode readback; never changes battery/brightness/a11y settings.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
import re
import statistics
import time
import uuid
from pathlib import Path

_BASE=Path(__file__).resolve().parent
_SPEC=importlib.util.spec_from_file_location("gc_android_performance",_BASE/"qa-android-performance.py")
_baseline=importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_baseline)
adb=_baseline.adb
PACKAGE=_baseline.PACKAGE
ACTIVITY=_baseline.ACTIVITY

def parse_gpu_histogram(dump:str)->dict:
    found=re.search(r"^GPU HISTOGRAM:\s*(.+)$",dump,re.MULTILINE)
    if not found:raise ValueError("No HWUI GPU histogram in Activity gfxinfo")
    bins={}
    for duration,count in re.findall(r"(\d+)ms=(\d+)",found.group(1)):
        duration,count=int(duration),int(count)
        if duration in bins:raise ValueError("Duplicate GPU bin")
        bins[duration]=count
    if len(bins)<4 or any(ms<0 or n<0 for ms,n in bins.items()):
        raise ValueError("Incomplete GPU histogram")
    size=sum(bins.values())
    if size<10:raise ValueError("Insufficient HWUI GPU samples")
    def percentile(pct:int)->int:
        threshold=(size*pct+99)//100
        cumulative=0
        for duration,count in sorted(bins.items()):
            cumulative+=count
            if cumulative>=threshold:return duration
        raise ValueError("Missing percentile")
    pipeline=re.search(r"^Pipeline=(.+)$",dump,re.MULTILINE)
    return {
        "samples":size,
        "p50_gpu_bucket_ms":percentile(50),
        "p90_gpu_bucket_ms":percentile(90),
        "p95_gpu_bucket_ms":percentile(95),
        "buckets_over_16ms_pct":round(sum(count for ms,count in bins.items() if ms>16)*100/size,2),
        "extreme_4950ms_bucket_count":bins.get(4950,0),
        "pipeline":pipeline.group(1).strip() if pipeline else None
    }

def benchmark(serial:str,mode:str,swipes:int,w:int,h:int)->dict:
    adb(serial,"shell","am","force-stop",PACKAGE)
    marker="gcui-hwui-gpu-"+uuid.uuid4().hex
    adb(serial,"shell","log","-p","i","-t","GCUI.QA",marker)
    adb(serial,"shell","am","start","-W","-n",ACTIVITY,"--es","gcui_preview_mode",mode)
    time.sleep(2.0)
    if _baseline.get_mode_from_log(serial,marker)!=mode:
        raise RuntimeError("Current resource mode did not match request")
    adb(serial,"shell","dumpsys","gfxinfo",PACKAGE,"reset")
    for i in range(swipes):
        lo,hi=int(h*.77),int(h*.32)
        y1,y2=(lo,hi) if i%2==0 else (hi,lo)
        adb(serial,"shell","input","swipe",str(w//2),str(y1),str(w//2),str(y2),"340")
        time.sleep(.2)
    raw=adb(serial,"shell","dumpsys","gfxinfo",PACKAGE,timeout=30)
    return {"mode":mode,"verified":True,
            "hwui_gpu_histogram":parse_gpu_histogram(raw),
            "activity_ui_frames":_baseline.parse_gfxinfo(raw)}

def summary(runs):
    out={}
    for mode in ("normal","conserve"):
        rows=[v["hwui_gpu_histogram"] for v in runs if v["mode"]==mode]
        out[mode]={"runs":len(rows)}
        for k in ("samples","p50_gpu_bucket_ms","p90_gpu_bucket_ms","p95_gpu_bucket_ms","buckets_over_16ms_pct"):
            out[mode][k+"_median"]=round(statistics.median(row[k] for row in rows),2) if rows else None
    return out

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--serial",required=True)
    p.add_argument("--blocks",type=int,default=1)
    p.add_argument("--swipes",type=int,default=6)
    p.add_argument("--output",type=Path,default=Path("/tmp/gc-ui-hwui-gpu.json"))
    a=p.parse_args()
    if not 1<=a.blocks<=3 or not 2<=a.swipes<=10:p.error("1-3 blocks; 2-10 swipes")
    if adb(a.serial,"get-state").strip()!="device":raise RuntimeError("Device unavailable")
    dims=re.search(r"Physical size:\s*(\d+)x(\d+)",adb(a.serial,"shell","wm","size"))
    if not dims:raise ValueError("ADB physical resolution unavailable")
    w,h=map(int,dims.groups())
    order=[]
    for i in range(a.blocks):order+=(
        ["normal","conserve","conserve","normal"] if i%2==0
        else ["conserve","normal","normal","conserve"])
    runs=[]
    for i,mode in enumerate(order,1):
        print(f"[{i}/{len(order)}] {mode}",flush=True)
        item=benchmark(a.serial,mode,a.swipes,w,h)
        runs.append(item)
        print("  HWUI:",item["hwui_gpu_histogram"],flush=True)
    record={
        "schema":"gc-ui-hwui-gpu-qa.v1",
        "device_context":{
            "model":adb(a.serial,"shell","getprop","ro.product.model").strip(),
            "api":adb(a.serial,"shell","getprop","ro.build.version.sdk").strip(),
            "resolution":f"{w}x{h}",
            "battery_context":_baseline.parse_battery(adb(a.serial,"shell","dumpsys","battery")),
            "device_settings_changed":False,
            "coverage":"Activity HWUI GPU histogram, not Chrome/WebView renderer GPU or system-wide utilization, not energy."
        },
        "parameters":{"order":order,"swipes_per_run":a.swipes},
        "runs":runs,"summary":summary(runs)
    }
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(record,indent=2)+"\n")
    print("SUMMARY:",json.dumps(record["summary"],indent=2),flush=True)

if __name__=="__main__":main()
