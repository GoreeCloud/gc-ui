"""Send a *native X11* browser zoom keystroke to an isolated browser window.

This requires a dedicated Xvfb display, libX11, and libXtst. Unlike Playwright
page.keyboard or CSS zoom, the XTest event reaches the browser window itself.
Never run against an interactive user's DISPLAY.
"""
import ctypes
import sys
import time

x11 = ctypes.CDLL("libX11.so.6")
xtst = ctypes.CDLL("libXtst.so.6")
x11.XOpenDisplay.argtypes = [ctypes.c_char_p]
x11.XOpenDisplay.restype = ctypes.c_void_p
x11.XRaiseWindow.argtypes = [ctypes.c_void_p, ctypes.c_ulong]
x11.XSetInputFocus.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.c_int, ctypes.c_ulong]
x11.XStringToKeysym.argtypes = [ctypes.c_char_p]
x11.XStringToKeysym.restype = ctypes.c_ulong
x11.XKeysymToKeycode.argtypes = [ctypes.c_void_p, ctypes.c_ulong]
x11.XKeysymToKeycode.restype = ctypes.c_uint
x11.XFlush.argtypes = [ctypes.c_void_p]
x11.XCloseDisplay.argtypes = [ctypes.c_void_p]
xtst.XTestFakeKeyEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_int, ctypes.c_ulong]
xtst.XTestFakeMotionEvent.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_ulong]
xtst.XTestFakeButtonEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_int, ctypes.c_ulong]

if len(sys.argv) not in (3, 5) or sys.argv[2] not in ("plus", "reset", "click"):
    sys.exit("Usage: qa-x11-zoom.py 0xWINDOW plus|reset|click [x y]")
display = x11.XOpenDisplay(None)
if not display:
    sys.exit("No X11 display")
window = int(sys.argv[1], 0)
x11.XRaiseWindow(display, window)
x11.XSetInputFocus(display, window, 1, 0)
x11.XFlush(display)
time.sleep(0.05)

def key(name, down):
    keysym = x11.XStringToKeysym(name.encode())
    code = x11.XKeysymToKeycode(display, keysym)
    if code == 0:
        raise RuntimeError("No X11 keycode for " + name)
    xtst.XTestFakeKeyEvent(display, code, int(down), 0)

if sys.argv[2] == "click":
    assert len(sys.argv) == 5
    xtst.XTestFakeMotionEvent(display, -1, int(sys.argv[3]), int(sys.argv[4]), 0)
    x11.XFlush(display)
    time.sleep(0.12)
    xtst.XTestFakeButtonEvent(display, 1, 1, 0)
    x11.XFlush(display)
    time.sleep(0.08)
    xtst.XTestFakeButtonEvent(display, 1, 0, 0)
    x11.XFlush(display)
    time.sleep(0.07)
    x11.XCloseDisplay(display)
    sys.exit(0)
keys = ["Control_L", "equal"] if sys.argv[2] == "plus" else ["Control_L", "0"]
for item in keys:
    key(item, True)
for item in reversed(keys):
    key(item, False)
x11.XFlush(display)
time.sleep(0.07)
x11.XCloseDisplay(display)
