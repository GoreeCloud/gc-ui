#!/usr/bin/env python3
"""Read-only GC UI power/device acceptance preflight, never an energy measurement.

Refuses to certify an ADB-visible phone as ready if externally powered or
charging. It never changes device, ADB, battery, accessibility or network state.
"""
from __future__ import annotations
import argparse
import json
import re
import subprocess
from pathlib import Path

def parse_adb_devices(raw:str)->list[str]:
    result=[]
    for line in raw.splitlines():
        parts=line.split()
        if len(parts)<2 or parts[1]!="device":continue
        serial=parts[0]
        if serial and all(c not in serial for c in "\r\n ;|"):result.append(serial)
    return result

def parse_battery(raw:str)->dict:
    required=["USB powered","AC powered","Wireless powered","Dock powered",
              "status","level","temperature"]
    # Match exact field names independently: the service heading itself ends
    # with a colon and must never consume the next line's AC-powered value.
    fields={}
    for name in required:
        match=re.search(r"(?m)^[ \t]*"+re.escape(name)+r":[ \t]*([^\r\n]+)",raw)
        if match:fields[name]=match.group(1)
    if any(name not in fields for name in required):
        raise ValueError("Required battery fields missing: do not infer power state")
    def integer(name):
        try:return int(fields[name].strip())
        except ValueError as error:raise ValueError("Invalid battery "+name) from error
    for key in required[:4]:
        if fields[key].strip() not in ("true","false"):
            raise ValueError("Unknown "+key)
    level=integer("level")
    temperature=integer("temperature")/10
    if not 0<=level<=100 or not -20<=temperature<=90:
        raise ValueError("Implausible level/temperature")
    return {"external_power":{key:fields[key].strip()=="true" for key in required[:4]},
            "status_code":integer("status"),"level_pct":level,
            "temperature_c":round(temperature,1)}

def assess_battery(battery:dict)->dict:
    problems=[]
    if any(battery["external_power"].values()):problems.append("external-power-connected")
    # Android BatteryManager: 2 charging, 5 full. Both must be confirmed
    # disconnected before trying an unplugged-discharge measurement.
    if battery["status_code"] in (2,5):problems.append("not-discharging")
    if battery["status_code"]!=3:problems.append("discharging-not-confirmed")
    if not 25<=battery["level_pct"]<=85:problems.append("battery-level-outside-controlled-window")
    if not 20<=battery["temperature_c"]<=38:
        problems.append("battery-temperature-outside-controlled-window")
    return {"ready_for_disconnected_workload":not problems,"blocking_reasons":problems}

def adb(*args:str)->str:
    process=subprocess.run(["adb",*args],capture_output=True,text=True,timeout=30)
    if process.returncode:
        raise RuntimeError("ADB read-only preflight failed; no state was changed: "+
                           " ".join(args[2:4])+" "+process.stderr[-120:])
    return process.stdout

def inspect(devices:list[dict])->dict:
    result=[]
    for index,device in enumerate(devices):
        kind="emulator" if device["is_emulator"] else "physical"
        entry={"id":"target-"+str(index+1),"kind":kind,
               "model":device["model"],"android_api":device["api"]}
        if device["battery"] is None:
            entry["battery_preflight"]={"ready_for_disconnected_workload":False,
                                       "blocking_reasons":["battery-status-unavailable"]}
        else:
            entry["battery"]=device["battery"]
            entry["battery_preflight"]=assess_battery(device["battery"])
        result.append(entry)
    physical=[d for d in result if d["kind"]=="physical"]
    return {"schema":"gc-ui-power-and-device-preflight.v1",
            "devices":result,
            "physical_device_count":len(physical),
            "second_physical_device_verified":len(physical)>=2,
            "disconnected_power_ready":any(
                x["battery_preflight"]["ready_for_disconnected_workload"]
                for x in physical),
            "energy_consumption_measured":False,
            "device_settings_changed":False,
            "limitations":"ADB source alone does not measure mWh/J, unplugged battery consumption, or external power meter data."}

def main()->None:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output",type=Path,
                        default=Path("/tmp/gc-ui-power-device-preflight.json"))
    parser.add_argument("--strict",action="store_true",
                        help="exit 2 unless two physical devices and one safe unplugged-power target")
    args=parser.parse_args()
    connected=parse_adb_devices(adb("devices","-l"))
    rows=[]
    for serial in connected:
        qemu=adb("-s",serial,"shell","getprop","ro.kernel.qemu").strip()
        is_emulator=serial.startswith("emulator-") or qemu=="1"
        model=adb("-s",serial,"shell","getprop","ro.product.model").strip()
        api=adb("-s",serial,"shell","getprop","ro.build.version.sdk").strip()
        battery=None
        try:battery=parse_battery(adb("-s",serial,"shell","dumpsys","battery"))
        except (ValueError,RuntimeError):pass
        rows.append({"is_emulator":is_emulator,
                     "model":model[:70],"api":api[:10],"battery":battery})
    report=inspect(rows)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(report,indent=2)+"\n")
    print("GC UI DEVICE/POWER PREFLIGHT",
          json.dumps({k:report[k] for k in ("physical_device_count",
                    "second_physical_device_verified","disconnected_power_ready",
                    "energy_consumption_measured")},sort_keys=True))
    print("Report (no serials):",args.output)
    if args.strict and not (report["second_physical_device_verified"] and
                            report["disconnected_power_ready"]):
        raise SystemExit(2)

if __name__=="__main__":main()
