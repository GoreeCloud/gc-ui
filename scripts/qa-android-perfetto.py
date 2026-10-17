#!/usr/bin/env python3
"""Bounded Android GC UI WebView/SurfaceFlinger Perfetto aggregate capture.

Raw OS traces are private and deleted locally after extracting narrow aggregate metrics.
No accessibility/power settings or data in other apps are changed.
The trace captures app/WebView/SurfaceFlinger CPU and GPU-related slices; it is not
a hardware GPU-energy trace and is not a per-process power measurement.
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import subprocess
import tempfile
import time
import uuid
from pathlib import Path

PACKAGE="com.goreecloud.gcui.preview"
ACTIVITY=PACKAGE+"/.GCNativeActivity"
SQL="""
SELECT 'gc_ui_webview_draw_gl' AS metric, COUNT(*) AS samples,
       ROUND(AVG(s.dur)/1000000.0,3) AS mean_ms,
       ROUND(MAX(s.dur)/1000000.0,3) AS max_ms
FROM slice s JOIN thread_track t ON s.track_id=t.id
JOIN thread th ON th.utid=t.utid JOIN process p ON th.upid=p.upid
WHERE p.name='com.goreecloud.gcui.preview' AND s.name='WebViewFunctor::drawGl'
UNION ALL
SELECT 'gc_ui_skia_gpu_execute', COUNT(*), ROUND(AVG(s.dur)/1000000.0,3),
       ROUND(MAX(s.dur)/1000000.0,3)
FROM slice s JOIN thread_track t ON s.track_id=t.id
JOIN thread th ON th.utid=t.utid JOIN process p ON th.upid=p.upid
WHERE p.name='com.goreecloud.gcui.preview' AND s.name LIKE 'auto skgpu::ganesh::OpsTask::onExecute%'
UNION ALL
SELECT 'surfaceflinger_skia_gpu_execute', COUNT(*),
       ROUND(AVG(s.dur)/1000000.0,3), ROUND(MAX(s.dur)/1000000.0,3)
FROM slice s JOIN thread_track t ON s.track_id=t.id
JOIN thread th ON th.utid=t.utid JOIN process p ON th.upid=p.upid
WHERE p.name='/system/bin/surfaceflinger' AND s.name LIKE 'auto skgpu::ganesh::OpsTask::onExecute%'
UNION ALL
SELECT 'webview_renderer_cpu_schedule', COUNT(*),
       ROUND(AVG(s.dur)/1000000.0,3), ROUND(MAX(s.dur)/1000000.0,3)
FROM sched_slice s JOIN thread th ON s.utid=th.utid
JOIN process p ON p.upid=th.upid
WHERE p.name LIKE 'com.android.webview:sandboxed_process%'
"""

def adb(serial:str,*args:str,timeout:float=45)->str:
    x=subprocess.run(["adb","-s",serial,*args],capture_output=True,text=True,timeout=timeout)
    if x.returncode:
        raise RuntimeError("ADB failed: "+" ".join(args)+" "+x.stderr[-250:])
    return x.stdout

def strip_perfetto_transport_logs(payload:bytes)->bytes:
    """On some Android versions perfetto -o - logs ANSI text before/after binary."""
    if payload.startswith(b"\x1b["):
        header_end=payload.find(b"\x1b[0m\n")
        if not 0<=header_end<2048:raise ValueError("Unknown Perfetto stdout header")
        payload=payload[header_end+len(b"\x1b[0m\n"):]
    # Never split on generic ANSI inside real protobuf. End marker is known
    # from this device's perfetto_cmd.cc footer and must be within 500 bytes.
    end=payload.rfind(b"\x1b[90m[")
    if end>=len(payload)-500:payload=payload[:end]
    if len(payload)<1024 or payload[:1]!=b"\x0a":
        raise ValueError("Invalid Perfetto trace packet prefix / size")
    return payload

def parse_aggregate_csv(output:str)->dict:
    """Parse limited stdout CSV from official Perfetto trace_processor_shell."""
    lines=output.strip().splitlines()
    csv_start=next((i for i,line in enumerate(lines) if line.startswith('"metric",')),None)
    if csv_start is None:raise ValueError("No Perfetto query result header")
    table=list(csv.DictReader(io.StringIO("\n".join(lines[csv_start:]))))
    expected={"gc_ui_webview_draw_gl","gc_ui_skia_gpu_execute",
              "surfaceflinger_skia_gpu_execute","webview_renderer_cpu_schedule"}
    values={}
    for row in table:
        metric=row["metric"]
        if metric not in expected:continue
        values[metric]={"samples":int(row["samples"] or "0"),
                         "mean_ms":float(row["mean_ms"]) if row["mean_ms"] else None,
                         "max_ms":float(row["max_ms"]) if row["max_ms"] else None}
    if set(values)!=expected:raise ValueError("Missing aggregate metrics")
    if values["gc_ui_webview_draw_gl"]["samples"]<1:
        raise ValueError("No measured WebView drawing slices")
    if values["webview_renderer_cpu_schedule"]["samples"]<1:
        raise ValueError("WebView sandboxed renderer CPU scheduling unavailable")
    return values

def run_one(serial:str,mode:str,processor:Path,swipes:int,w:int,h:int)->dict:
    adb(serial,"shell","am","force-stop",PACKAGE)
    marker="gcui-perfetto-"+uuid.uuid4().hex
    adb(serial,"shell","log","-p","i","-t","GCUI.QA",marker)
    adb(serial,"shell","am","start","-W","-n",ACTIVITY,
        "--es","gcui_preview_mode",mode)
    time.sleep(2.0)
    log=adb(serial,"logcat","-d","-s","GCUI.QA:I","GCUI.Perf:I","*:S")
    from_line=next((i for i,v in enumerate(log.splitlines()) if marker in v),None)
    if from_line is None or not any('resourceMode="'+mode+'"' in v
                                    for v in log.splitlines()[from_line+1:]):
        raise RuntimeError("Current GC UI resource mode readback missing")
    with tempfile.TemporaryDirectory(prefix="gcui-perfetto-") as private:
        trace_path=Path(private)/"private-system-trace.pftrace"
        with trace_path.open("wb") as raw:
            proc=subprocess.Popen(["adb","-s",serial,"exec-out","perfetto",
                "-o","-","-t","8s","-b","8mb","-a",PACKAGE,
                "gfx","view","webview","sched","freq"],stdout=raw,stderr=subprocess.PIPE)
            try:
                time.sleep(1.5)
                for i in range(swipes):
                    lo,hi=int(h*.77),int(h*.32)
                    src,dst=(lo,hi) if i%2==0 else (hi,lo)
                    adb(serial,"shell","input","swipe",str(w//2),str(src),str(w//2),
                        str(dst),"280")
                    time.sleep(.11)
                _,error=proc.communicate(timeout=26)
            finally:
                if proc.poll() is None:proc.terminate();proc.wait(timeout=5)
            if proc.returncode:
                raise RuntimeError("Perfetto capture failed: "+error.decode(errors="replace")[-200:])
        captured=trace_path.read_bytes()
        clean=strip_perfetto_transport_logs(captured)
        trace_path.write_bytes(clean)
        completed=subprocess.run([str(processor),"query",str(trace_path),SQL],
             capture_output=True,text=True,timeout=30)
        if completed.returncode:
            raise RuntimeError("Perfetto SQL failed: "+completed.stderr[-300:])
        aggregate=parse_aggregate_csv(completed.stdout)
        return {"mode":mode,"mode_verified":True,"trace_payload_bytes":len(clean),
                "aggregate":aggregate}

def main()->None:
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--serial",required=True)
    cli.add_argument("--trace-processor",type=Path,required=True)
    cli.add_argument("--swipes",type=int,default=5)
    cli.add_argument("--output",type=Path,default=Path("/tmp/gcui-perfetto-aggregate.json"))
    args=cli.parse_args()
    if not 3<=args.swipes<=6:cli.error("3-6 swipes per run supported")
    if not args.trace_processor.is_file():cli.error("Official Perfetto trace processor required")
    if adb(args.serial,"get-state").strip()!="device":raise RuntimeError("Device offline")
    dims=re.search(r"Physical size:\s*(\d+)x(\d+)",adb(args.serial,"shell","wm","size"))
    if not dims:raise ValueError("Screen dimensions unavailable")
    w,h=map(int,dims.groups())
    records=[]
    for mode in ("normal","conserve"):
        print("Perfetto app/WebView/SurfaceFlinger",mode,flush=True)
        record=run_one(args.serial,mode,args.trace_processor,args.swipes,w,h)
        records.append(record)
        print("  GC UI WebView draw:",record["aggregate"]["gc_ui_webview_draw_gl"],flush=True)
    data={"schema":"gc-ui-perfetto-aggregate.v1",
          "context":{"android_api":adb(args.serial,"shell","getprop","ro.build.version.sdk").strip(),
                     "device_model":adb(args.serial,"shell","getprop","ro.product.model").strip(),
                     "device_settings_changed":False,
                     "scope":"App WebViewFunctor, Skia GPU-related CPU slices, SurfaceFlinger Skia CPU slices and renderer CPU schedule; not actual GPU utilization/energy."},
          "runs":records,
          "caveats":["Two sequential eight-second traces; no statistical power/energy claims.",
                     "GPU-related CPU slices are not hardware GPU execution duration.",
                     "Raw system trace discarded after query; no raw process names other than known GC UI, SurfaceFlinger, WebView aggregates exported."]}
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(data,indent=2)+"\n")
    print("Aggregate report saved:",args.output)

if __name__=="__main__":
    main()
