#!/usr/bin/env python3
"""Isolated real Chromium + Orca generated-speech and AT-SPI diagnostic.

Run: xvfb-run -a dbus-run-session -- /usr/bin/python3 scripts/qa_browser_orca.py
This reads only local GC UI fixture pages. No real audio, user desktop settings,
credentials, or persistent Orca preferences. The output is bounded fixture-only
evidence; not a human-heard screen-reader or WCAG certification.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parent.parent
SPEECH_CHECKS = {
    "menu_trigger": r"Workspace actions.*push button",
    "menu_first_action": r"Duplicate workspace",
    "forms_combobox": r"Search projects.*combo box",
    "forms_suggestion": r"Studio refresh",
    "password_reveal_control": r"Reveal sample passphrase",
}
AT_TARGETS = {
    ("Workspace actions", "push button"),
    ("Workspace actions", "menu"),
    ("Duplicate workspace", "menu item"),
    ("Archive (unavailable)", "menu item"),
    ("Search projects", "combo box"),
    ("Studio refresh", "list item"),
    ("Reveal sample passphrase", "toggle button"),
}


def parse_speech(log: str) -> dict[str, bool]:
    utterances = re.findall(r"SPEECH OUTPUT: '([^'\r\n]+)'", log)
    return {
        name: any(re.search(pattern, utterance, re.I) for utterance in utterances)
        for name, pattern in SPEECH_CHECKS.items()
    }


def visit(node, found: set[tuple[str, str]], depth=0,
          pressed_states: set[bool] | None = None, pressed_state=None):
    if node is None or depth > 13:
        return
    try:
        name = node.get_name() or ""
        role = node.get_role_name() or ""
        if (name, role) in AT_TARGETS:
            found.add((name, role))
        if ((name, role) == ("Reveal sample passphrase", "toggle button")
                and pressed_states is not None and pressed_state is not None):
            # Inspect the real AT-SPI exposure, not only DOM aria-pressed.
            pressed_states.add(bool(node.get_state_set().contains(pressed_state)))
        for index in range(min(node.get_child_count(), 150)):
            visit(node.get_child_at_index(index), found, depth + 1,
                  pressed_states, pressed_state)
    except (LookupError, RuntimeError):
        return


def collect_atspi(atspi, pressed_states: set[bool] | None = None
                  ) -> set[tuple[str, str]]:
    found: set[tuple[str, str]] = set()
    desktop = atspi.get_desktop(0)
    pressed_state = (atspi.StateType.PRESSED if pressed_states is not None
                     else None)
    for index in range(min(desktop.get_child_count(), 60)):
        app = desktop.get_child_at_index(index)
        if app is None:
            continue
        try:
            if any(token in (app.get_name() or "").lower()
                   for token in ("chrome for testing", "chromium")):
                visit(app, found, pressed_states=pressed_states,
                      pressed_state=pressed_state)
        except (LookupError, RuntimeError):
            continue
    return found


def run() -> dict:
    if not os.environ.get("DISPLAY") or not os.environ.get("DBUS_SESSION_BUS_ADDRESS"):
        raise RuntimeError("Isolated X11 display and D-Bus session are required")
    if not shutil.which("orca"):
        raise RuntimeError("Actual Orca executable is required")
    import gi
    gi.require_version("Atspi", "2.0")
    from gi.repository import Atspi

    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]

    with tempfile.TemporaryDirectory(prefix="gc-ui-browser-orca-") as name:
        work = Path(name)
        for sub in ("config", "cache", "prefs"):
            (work / sub).mkdir()
        env = dict(
            os.environ,
            NO_AT_BRIDGE="0",
            GSETTINGS_BACKEND="memory",
            PULSE_SERVER="unix:/tmp/gc-ui-orca-no-audio",
            XDG_CONFIG_HOME=str(work / "config"),
            XDG_CACHE_HOME=str(work / "cache"),
            PLAYWRIGHT_BROWSERS_PATH=os.environ.get(
                "PLAYWRIGHT_BROWSERS_PATH", str(Path.home() / ".cache" / "ms-playwright")
            ),
            GC_UI_AT_PORT=str(port),
            GC_UI_AT_PRESSED_GATE=str(work / "password-pressed-observed.flag"),
        )
        procs: list[subprocess.Popen] = []
        handles = []
        try:
            def launch(args, log_name, cwd=ROOT):
                handle = (work / log_name).open("w")
                handles.append(handle)
                proc = subprocess.Popen(
                    args, cwd=cwd, env=env,
                    stdout=handle, stderr=subprocess.STDOUT
                )
                procs.append(proc)
                return proc

            server = launch(
                ["python3", "-m", "http.server", str(port), "--bind", "127.0.0.1"],
                "server.log"
            )
            time.sleep(1)
            if server.poll() is not None:
                raise RuntimeError("Local fixture server failed")
            orca = launch(
                ["orca", "--debug", "--debug-file", str(work / "orca.log"),
                 "--user-prefs", str(work / "prefs")],
                "orca-stdout.log"
            )
            time.sleep(3)
            if orca.poll() is not None:
                raise RuntimeError("Orca exited before test browser launch")
            browser = launch(["node", "scripts/qa-browser-orca.mjs"], "browser.log")
            found: set[tuple[str, str]] = set()
            reveal_pressed_states: set[bool] = set()
            gate = work / "password-pressed-observed.flag"
            deadline = time.monotonic() + 44
            while time.monotonic() < deadline and browser.poll() is None:
                found.update(collect_atspi(Atspi, reveal_pressed_states))
                if True in reveal_pressed_states and not gate.exists():
                    gate.write_text("AT-SPI pressed state observed\n")
                time.sleep(0.4)
            browser.wait(timeout=10)
            for handle in handles:
                handle.flush()
            output = (work / "browser.log").read_text(errors="replace")
            speech = parse_speech(
                (work / "orca.log").read_text(errors="replace")
                if (work / "orca.log").exists() else ""
            )
            phases = {
                "components_menu": "PHASE_COMPONENTS_MENU_OPEN" in output,
                "forms_suggestion": "PHASE_FORMS_SUGGESTION_OPEN" in output,
                "password_focused": "PHASE_PASSWORD_REVEAL_FOCUSED" in output,
                "password_revealed": "PHASE_PASSWORD_REVEAL_ON" in output,
                "password_masked": "PHASE_PASSWORD_REVEAL_OFF" in output,
            }
            targets = {name + " / " + role: (name, role) in found
                       for name, role in sorted(AT_TARGETS)}
            result = {
                "schema": "gc-ui-isolated-browser-orca.v1",
                "browser_exit_zero": browser.returncode == 0,
                "orca_generated_speech": speech,
                "atspi_named_roles": targets,
                "atspi_password_reveal_states": {
                    "masked": False in reveal_pressed_states,
                    "revealed": True in reveal_pressed_states,
                },
                "browser_interaction_phases": phases,
                "human_heard_audio": False,
                "scope": "Isolated Linux Chromium + Orca fixture, no NVDA/VoiceOver claim",
            }
            if not (result["browser_exit_zero"] and all(speech.values())
                    and all(targets.values()) and all(phases.values())
                    and all(result["atspi_password_reveal_states"].values())):
                raise RuntimeError("Browser/Orca acceptance incomplete: " +
                                   json.dumps(result, sort_keys=True))
            return result
        finally:
            for proc in reversed(procs):
                if proc.poll() is None:
                    proc.terminate()
                    try:
                        proc.wait(timeout=4)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                        proc.wait(timeout=4)
            for handle in handles:
                handle.close()


def main():
    print(json.dumps(run(), sort_keys=True, indent=2), flush=True)


if __name__ == "__main__":
    main()
