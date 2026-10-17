#!/usr/bin/env python3
"""Bounded GC UI native Electron + Orca speech-generation diagnostic.

Start with xvfb-run -a dbus-run-session -- /usr/bin/python3 scripts/qa-orca-speech.py
Only logs expected test utterances; raw Orca logs are ephemeral and not published.
This does NOT replace a human-audible screen-reader acceptance test.
"""
from __future__ import annotations
import argparse
import json
import os
import re
import subprocess
import tempfile
import time
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
REQUIRED={
 "platform_role":"Platform profile combo box",
 "platform_value":"Desktop",
 "conservation_role_state":"Preview resource conservation check box not checked",
 "appearance_role":"Switch to (dark|light) appearance push button"
}
FOCUS_NAMES=("Platform profile","Preview resource conservation","Switch to dark appearance","Switch to light appearance")

def parse_speech_output(log:str)->dict:
    utterances=re.findall(r"SPEECH OUTPUT: '([^'\r\n]+)'",log)
    found={}
    for key,part in REQUIRED.items():
        found[key]=any(re.search(part,spoken) if key=="appearance_role" else part in spoken
                       for spoken in utterances)
    return {"checks":found,"all_required_generated":all(found.values()),
            "matched_utterances":{k:next((text for text in utterances
                                         if (re.search(v,text) if k=="appearance_role" else v in text)),None)
                                   for k,v in REQUIRED.items()}}

def enumerate_controls(pyatspi)->dict:
    apps=[app for app in pyatspi.Registry.getDesktop(0)
          if (app.name or "").lower()=="electron"]
    if len(apps)!=1:
        raise RuntimeError("Expected exactly one Electron app in isolated AT-SPI session")
    targets={}
    def visit(item,depth=0):
        if depth>14:return
        try:
            if item.name in FOCUS_NAMES and item.getRoleName() in ("combo box","check box","push button"):
                targets[item.name]=item
            for child in list(item)[:110]:visit(child,depth+1)
        except (LookupError,RuntimeError):
            return
    visit(apps[0])
    return targets

def run(electron:Path)->dict:
    if not electron.is_file():raise RuntimeError("Pinned Electron executable not installed")
    if not os.environ.get("DISPLAY"):raise RuntimeError("Virtual X display required")
    if not os.environ.get("DBUS_SESSION_BUS_ADDRESS"):
        raise RuntimeError("Isolated D-Bus session required")
    import pyatspi
    with tempfile.TemporaryDirectory(prefix="gc-orca-qa-") as directory:
        work=Path(directory)
        prefs=work/"orca-prefs";prefs.mkdir()
        log=work/"orca-debug.log"
        env={**os.environ,"NO_AT_BRIDGE":"0","ELECTRON_DISABLE_SECURITY_WARNINGS":"true",
             # Keep this test silent on the operator's audio hardware.
             "PULSE_SERVER":"unix:/tmp/gc-ui-qa-unreachable-audio"}
        orca=None
        app=None
        try:
            version=subprocess.run(["/usr/bin/orca","--version"],capture_output=True,
                                   text=True,timeout=5,check=True).stdout.strip()
            with (work/"orca-stdout.log").open("w") as devnull:
                orca=subprocess.Popen(
                    ["/usr/bin/orca","--debug","--debug-file",str(log),
                     "--user-prefs",str(prefs)],
                    stdout=devnull,stderr=subprocess.STDOUT,env=env)
            time.sleep(3)
            with (work/"electron-stdout.log").open("w") as devnull:
                app=subprocess.Popen(
                    [str(electron),"native/desktop","--force-renderer-accessibility"],
                    cwd=ROOT,stdout=devnull,stderr=subprocess.STDOUT,env=env)
            found={}
            deadline=time.monotonic()+22
            while time.monotonic()<deadline:
                if app.poll() is not None:raise RuntimeError("Electron closed before Orca review")
                try:found=enumerate_controls(pyatspi)
                except RuntimeError:pass
                if "Platform profile" in found and "Preview resource conservation" in found and (
                 "Switch to dark appearance" in found or "Switch to light appearance" in found):break
                time.sleep(.8)
            else:raise RuntimeError("Named Electron controls missing from AT-SPI")
            focus={}
            appearance=("Switch to dark appearance" if "Switch to dark appearance" in found
                        else "Switch to light appearance")
            names=[appearance,"Platform profile","Preview resource conservation"]
            for name in names:
                focus[name]=bool(found[name].queryComponent().grabFocus())
                time.sleep(1.8)
            time.sleep(3.0)
            raw=log.read_text(errors="replace") if log.exists() else ""
            parsed=parse_speech_output(raw)
            if not parsed["all_required_generated"] or not all(focus.values()):
                raise RuntimeError("Orca did not generate all expected speech events and focus transitions: "+
                                   json.dumps({"spoken":parsed["checks"],"focus":focus}))
            return {"schema":"gc-ui-orca-generated-speech-qa.v1",
                    "orca_version":version,
                    "native_host":"sandboxed Electron with forced renderer accessibility on isolated X11/DBus",
                    "focus_accepted":focus,**parsed,
                    "audio_actually_heard_by_human":False,
                    "operator_desktop_accessibility_changed":False,
                    "privacy":"Raw Orca debug trace and temp preferences discarded after parsing."}
        finally:
            for proc in [app,orca]:
                if proc and proc.poll() is None:
                    proc.terminate()
                    try:proc.wait(timeout=6)
                    except subprocess.TimeoutExpired:proc.kill();proc.wait(timeout=4)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--electron",type=Path,default=ROOT/"native/desktop/node_modules/electron/dist/electron")
    parser.add_argument("--output",type=Path,default=Path("/tmp/gc-ui-orca-speech-qa.json"))
    args=parser.parse_args()
    result=run(args.electron)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,indent=2)+"\n")
    print("ORCA SPEECH-GENERATION PASS",json.dumps(result["checks"],sort_keys=True),flush=True)

if __name__=="__main__":main()
