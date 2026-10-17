"""Parser tests for the bounded GC UI Android ADB performance probe; no device needed."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location("gc_perf",Path(__file__).parent/"qa-android-performance.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class PerformanceParserTest(unittest.TestCase):
 def test_gfxinfo_parses_ui_summary_only(self):
  txt="""Total frames rendered: 100
Janky frames: 14 (14.0%)
50th percentile: 8ms
90th percentile: 16ms
95th percentile: 32ms
99th percentile: 85ms
GPU HISTOGRAM: 99th gpu percentile: 4950ms
"""
  result=module.parse_gfxinfo(txt)
  self.assertEqual(result["rendered"],100)
  self.assertEqual(result["janky"],14)
  self.assertEqual(result["jank_pct"],14.0)
  self.assertEqual(result["p99_ms"],85)
  self.assertRaises(ValueError,module.parse_gfxinfo,"missing summary")
 def test_meminfo_and_battery_units(self):
  out=module.parse_meminfo("TOTAL PSS: 69071 TOTAL RSS: 159320 TOTAL SWAP PSS: 905")
  self.assertEqual(out["pss_kib"],69071)
  self.assertEqual(out["rss_kib"],159320)
  status=module.parse_battery(" USB powered: true\n level: 95\n temperature: 297\n")
  self.assertEqual(status,{"level_pct":95,"temperature_c":29.7,"usb_powered":True})
 def test_per_run_mode_readback_rejects_stale_device_log(self):
  log='''GCUI.QA : prior-run
GCUI.Perf: resourceMode="conserve"
GCUI.QA : gc-ui-run-current
GCUI.Perf: resourceMode="normal"
'''
  with patch.object(module,"adb",return_value=log):
   self.assertEqual(module.get_mode_from_log("local-device","gc-ui-run-current"),"normal")
   with self.assertRaises(RuntimeError):
    module.get_mode_from_log("local-device","missing-marker")
 def test_medians_ignore_unavailable_metrics(self):
  samples=[
   {"mode":"normal","frame_ui_thread":{"rendered":100,"janky":15,"jank_pct":15.0,"p90_ms":21},"memory":{"pss_kib":60000,"rss_kib":120000}},
   {"mode":"normal","frame_ui_thread":{"rendered":120,"janky":20,"jank_pct":16.67,"p90_ms":25},"memory":{"pss_kib":70000,"rss_kib":130000}},
   {"mode":"conserve","frame_ui_thread":{"rendered":80,"janky":9,"jank_pct":11.25,"p90_ms":15},"memory":{"pss_kib":64000,"rss_kib":123000}}
  ]
  summary=module.summarize(samples)
  self.assertEqual(summary["normal"]["app_pss_kib_median"],65000)
  self.assertEqual(summary["normal"]["ui_p90_ms_median"],23)
  self.assertEqual(summary["conserve"]["runs"],1)
  self.assertEqual(summary["conserve"]["ui_janky_frames_median"],9)
if __name__=="__main__":unittest.main()
