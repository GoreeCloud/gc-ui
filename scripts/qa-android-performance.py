#!/usr/bin/env python3
"""Bounded ADB UI-thread performance comparison of the GC UI Android debug preview.

No battery saver, brightness, accessibility, developer or system settings are changed.
Frame data are Activity UI-thread gfxinfo only, NOT WebView GPU / energy measurements.
"""
from __future__ import annotations
import argparse
import json
import re
import statistics
import subprocess
import time
import uuid
from pathlib import Path

PACKAGE="com.goreecloud.gcui.preview"
ACTIVITY=f"{PACKAGE}/.GCNativeActivity"
TAG="GCUI.Perf"
FRAME_KEYS={
    "rendered":"Total frames rendered",
    "janky":"Janky frames",
    "p50_ms":"50th percentile",
    "p90_ms":"90th percentile",
    "p95_ms":"95th percentile",
    "p99_ms":"99th percentile",
}
VALID_MODES=("normal","conserve")

def parse_gfxinfo(content: str)->dict:
    """Parse only the first Activity-process heading; keep GPU histogram out of estimates."""
    first=content.split("GPU HISTOGRAM:",1)[0]
    out={}
    for key,label in FRAME_KEYS.items():
        match=re.search(r"^"+re.escape(label)+r":\s*(\d+)",first,re.MULTILINE)
        out[key]=int(match.group(1)) if match else None
    if out["rendered"] is None or out["janky"] is None:
        raise ValueError("Android gfxinfo UI-frame summary was not available")
    out["jank_pct"]=round(100*out["janky"]/out["rendered"],2) if out["rendered"] else None
    return out

def parse_meminfo(content: str)->dict:
    vals={}
    for key,pattern in {
        "pss_kib":r"TOTAL PSS:\s*(\d+)",
        "rss_kib":r"TOTAL RSS:\s*(\d+)",
        "swap_pss_kib":r"TOTAL SWAP PSS:\s*(\d+)"
    }.items():
        match=re.search(pattern,content)
        vals[key]=int(match.group(1)) if match else None
    if vals["pss_kib"] is None:raise ValueError("App total PSS missing")
    return vals

def parse_battery(content: str)->dict:
    def field(name):
        match=re.search(r"^\s*"+re.escape(name)+r":\s*([^\r\n]+)",content,re.MULTILINE)
        return match.group(1).strip() if match else None
    temperature=field("temperature")
    return {"level_pct":int(field("level")) if (field("level") or "").isdigit() else None,
            "temperature_c":round(int(temperature)/10,1) if (temperature or "").isdigit() else None,
            "usb_powered":field("USB powered")=="true"}

def adb(serial:str,*args:str,timeout:float=25)->str:
    command=["adb","-s",serial,*args]
    completed=subprocess.run(command,capture_output=True,text=True,timeout=timeout)
    if completed.returncode:
        raise RuntimeError("ADB command failed: "+ " ".join(args)+
                           " :: "+completed.stderr.strip()[-220:])
    return completed.stdout

def get_mode_from_log(serial:str,marker:str)->str|None:
    lines=adb(serial,"logcat","-d","-s","GCUI.QA:I",TAG+":I","*:S",timeout=15).splitlines()
    # Ignore any prior cached GCUI.Perf lines from older app launches.
    boundary=next((i for i in range(len(lines)-1,-1,-1) if marker in lines[i]),-1)
    if boundary<0:raise RuntimeError("Benchmark run marker not found in device log")
    for line in reversed(lines[boundary+1:]):
        match=re.search(r'resourceMode="?(normal|conserve)"?',line)
        if match:return match.group(1)
    return None

def run_one(serial:str,mode:str,swipes:int,settle:float,size:tuple[int,int])->dict:
    adb(serial,"shell","am","force-stop",PACKAGE)
    marker="gc-ui-run-"+uuid.uuid4().hex
    adb(serial,"shell","log","-p","i","-t","GCUI.QA",marker)
    adb(serial,"shell","am","start","-W","-n",ACTIVITY,"--es","gcui_preview_mode",mode)
    time.sleep(max(1.2,settle))
    reported=get_mode_from_log(serial,marker)
    if reported!=mode:
        raise RuntimeError(f"Debug-mode readback mismatch: expected {mode}, got {reported}")
    adb(serial,"shell","dumpsys","gfxinfo",PACKAGE,"reset")
    start=time.monotonic()
    width,height=size
    for index in range(swipes):
        # Bidirectional viewport scrolls use touch gestures, never background device settings.
        high=int(height*.32);low=int(height*.77)
        sy,ey=(low,high) if index%2==0 else (high,low)
        adb(serial,"shell","input","swipe",str(width//2),str(sy),str(width//2),str(ey),"340")
        time.sleep(.22)
    elapsed=round(time.monotonic()-start,2)
    frames=parse_gfxinfo(adb(serial,"shell","dumpsys","gfxinfo",PACKAGE,timeout=30))
    memory=parse_meminfo(adb(serial,"shell","dumpsys","meminfo",PACKAGE,timeout=30))
    return {"mode":mode,"mode_verified":True,"swipes":swipes,"duration_s":elapsed,
            "frame_ui_thread":frames,"memory":memory,"battery_after":parse_battery(
                adb(serial,"shell","dumpsys","battery"))}

def summarize(samples:list[dict])->dict:
    summary={}
    for mode in VALID_MODES:
        rows=[row for row in samples if row["mode"]==mode]
        def median(path):
            vals=[]
            for row in rows:
                v=row
                for key in path:v=v.get(key) if isinstance(v,dict) else None
                if isinstance(v,(int,float)) and not isinstance(v,bool):vals.append(v)
            return round(statistics.median(vals),2) if vals else None
        summary[mode]={
            "runs":len(rows),
            "ui_frames_median":median(["frame_ui_thread","rendered"]),
            "ui_janky_frames_median":median(["frame_ui_thread","janky"]),
            "ui_jank_pct_median":median(["frame_ui_thread","jank_pct"]),
            "ui_p90_ms_median":median(["frame_ui_thread","p90_ms"]),
            "app_pss_kib_median":median(["memory","pss_kib"]),
            "app_rss_kib_median":median(["memory","rss_kib"])
        }
    return summary

def main()->None:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--serial",required=True,help="ADB device serial (not written into output JSON)")
    parser.add_argument("--rounds",type=int,default=2,help="Paired runs per mode (1-4)")
    parser.add_argument("--swipes",type=int,default=6,help="Scroll gestures per run (2-12)")
    parser.add_argument("--settle",type=float,default=2.0,help="Warm-up delay after start, seconds (1-5)")
    parser.add_argument("--output",type=Path,default=Path("/tmp/gc-ui-android-performance.json"))
    args=parser.parse_args()
    if not 1<=args.rounds<=4 or not 2<=args.swipes<=12 or not 1<=args.settle<=5:
        parser.error("Use 1-4 rounds, 2-12 swipes, and 1-5 seconds warm-up")
    device=adb(args.serial,"get-state").strip()
    if device!="device":raise RuntimeError("ADB target not authorized or online")
    dimensions=adb(args.serial,"shell","wm","size")
    match=re.search(r"Physical size:\s*(\d+)x(\d+)",dimensions)
    if not match:raise RuntimeError("Physical device dimensions unavailable")
    size=(int(match.group(1)),int(match.group(2)))
    baseline=parse_battery(adb(args.serial,"shell","dumpsys","battery"))
    # ABBA (and reversed BAAB on subsequent pairs) reduces thermal/time-order bias.
    order=sum((["normal","conserve","conserve","normal"] if index%2==0
               else ["conserve","normal","normal","conserve"]
               for index in range(args.rounds)),[])
    # Here rounds denotes two runs *per* mode per four-sequence.
    samples=[]
    for number,mode in enumerate(order,1):
        print(f"[{number}/{len(order)}] {mode} UI scroll benchmark",flush=True)
        sample=run_one(args.serial,mode,args.swipes,args.settle,size)
        samples.append(sample)
        print("  UI frames:",sample["frame_ui_thread"]["rendered"],
              "janky:",sample["frame_ui_thread"]["janky"],
              "app PSS KiB:",sample["memory"]["pss_kib"],flush=True)
    report={
        "schema":"gc-ui-android-performance-qa.v1",
        "context":{"device_model":adb(args.serial,"shell","getprop","ro.product.model").strip(),
                   "android_sdk":adb(args.serial,"shell","getprop","ro.build.version.sdk").strip(),
                   "resolution":f"{size[0]}x{size[1]}",
                   "battery_before":baseline,
                   "usb_powered_during_test":baseline["usb_powered"],
                   "note":"Single Android device, debug APK, USB-powered; gfxinfo counts Activity UI frames only. No direct WebView compositor GPU, battery energy, or rendering quality measurements.",
                   "device_settings_changed":False},
        "parameters":{"paired_blocks":args.rounds,"swipes_per_run":args.swipes,
                      "warmup_s":args.settle,"order":order},
        "runs":samples,"summary":summarize(samples)
    }
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps(report["summary"],indent=2))
    print("Report:",args.output)
    print("Caution: no energy savings, device-class generalization or frame-compositor claims.")

if __name__=="__main__":
    main()
