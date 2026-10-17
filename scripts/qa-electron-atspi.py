#!/usr/bin/env python3
"""Inspect GC UI Electron's real Linux AT-SPI accessibility tree.

Requires python3-pyatspi, Xvfb and dbus-run-session. No Orca speech PASS claimed.
Run via: xvfb-run -a dbus-run-session -- python3 scripts/qa-electron-atspi.py
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import subprocess
import time

REPO=Path(__file__).resolve().parent.parent
REQUIRED={
    ("document web","GC UI · Experience Studio"),
    ("heading","Tune the experience."),
    ("combo box","Platform profile"),
    ("combo box","Content context"),
    ("combo box","Surface priority"),
    ("check box","Preview without motion"),
    ("check box","Preview resource conservation"),
    ("push button","Test native selection feedback"),
    ("push button","Show coordinated transition")
}

def verify_tree(nodes:list[tuple[str,str]])->dict:
    present=set(nodes)
    missing=sorted(REQUIRED-present)
    has_appearance=any(role=="push button" and label.startswith("Switch to ") and
                       label.endswith(" appearance") for role,label in nodes)
    if missing or not has_appearance:
        raise ValueError("Electron AT-SPI missing controls: "+str(missing)+
                         "; appearance button: "+str(has_appearance))
    return {"required_role_name_pairs":len(REQUIRED)+1,
            "all_required_present":True,"document_found":True,
            "appearance_accessible_name_found":True}

def scan_electron_accessibility(pyatspi)->tuple[list[tuple[str,str]],int]:
    desktop=pyatspi.Registry.getDesktop(0)
    apps=[app for app in desktop if (app.name or "").lower()=="electron"]
    if len(apps)!=1:raise RuntimeError("Expected exactly one GC UI Electron app in isolated bus")
    nodes=[]
    visited=0
    def visit(item,depth):
        nonlocal visited
        if depth>15 or visited>=1500:return
        try:
            visited+=1
            nodes.append((item.getRoleName(),item.name or ""))
            for child in list(item)[:150]:
                visit(child,depth+1)
        except (LookupError,RuntimeError):
            return
    visit(apps[0],0)
    return nodes,visited

def electron_arguments(binary:Path, hosted_ci:bool=False)->list[str]:
    args=[str(binary),"native/desktop","--force-renderer-accessibility"]
    # Electron Playwright's hosted smoke already applies this for Linux CI.
    # Do not weaken the OS sandbox on the operator's ordinary desktop session.
    if hosted_ci:
        args.append("--no-sandbox")
    return args

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--electron",type=Path,
                        default=REPO/"native/desktop/node_modules/electron/dist/electron")
    parser.add_argument("--output",type=Path,default=Path("/tmp/gc-ui-electron-atspi.json"))
    args=parser.parse_args()
    if not args.electron.is_file():raise RuntimeError("Pinned desktop Electron not installed")
    import pyatspi
    env={**os.environ,"NO_AT_BRIDGE":"0","ELECTRON_DISABLE_SECURITY_WARNINGS":"true"}
    hosted_ci=os.environ.get("GITHUB_ACTIONS")=="true"
    proc=subprocess.Popen(electron_arguments(args.electron,hosted_ci),
                          cwd=REPO,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,env=env)
    try:
        last=None
        deadline=time.monotonic()+28
        while time.monotonic()<deadline:
            if proc.poll() is not None:raise RuntimeError("Electron exited before AT-SPI inspection")
            try:
                nodes,total=scan_electron_accessibility(pyatspi)
                result=verify_tree(nodes)
                break
            except (RuntimeError,ValueError) as error:
                last=error
                time.sleep(.7)
        else:raise RuntimeError("Accessible controls did not appear: "+str(last))
        output={
            "schema":"gc-ui-electron-atspi-qa.v1",
            "host":"Linux X11 virtual display in isolated D-Bus session",
            "runner_os_sandbox_exception":hosted_ci,
            "method":"AT-SPI document role/name inspection with Electron force-renderer-accessibility flag",
            "result":result,
            "visited_accessible_nodes":total,
            "limitations":"No human speech check, no Orca audio confirmation, no keyboard-gesture or NVDA/VoiceOver certification."
        }
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(output,indent=2)+"\n")
        print("AT-SPI GC UI PASS",json.dumps(result),"nodes",total,flush=True)
    finally:
        if proc.poll() is None:
            proc.terminate()
            try:proc.wait(timeout=8)
            except subprocess.TimeoutExpired:proc.kill();proc.wait(timeout=5)

if __name__=="__main__":main()
