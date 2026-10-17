"""Tests for GC UI Android Perfetto conservative aggregation."""
import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location("gcperfetto",Path(__file__).parent/"qa-android-perfetto.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
class PerfettoTest(unittest.TestCase):
 def test_footer_logs_are_removed(self):
  payload=b'\x1b[90m[12.1] some log\x1b[0m\n'+b'\x0a'+b'A'*1200+b'\x1b[90m[14.1] done\x1b[0m\n'
  self.assertEqual(m.strip_perfetto_transport_logs(payload),b'\x0a'+b'A'*1200)
 def test_fail_closed_short_trace(self):
  with self.assertRaises(ValueError):m.strip_perfetto_transport_logs(b'\x0aA')
 def test_aggregate_filters_and_requires_webview(self):
  csv='"metric","samples","mean_ms","max_ms"\n'
  csv+='gc_ui_webview_draw_gl,10,1.2,3\n'
  csv+='gc_ui_skia_gpu_execute,2,0.4,1\n'
  csv+='surfaceflinger_skia_gpu_execute,5,0.8,2\n'
  csv+='webview_renderer_cpu_schedule,34,0.1,0.4\n'
  report=m.parse_aggregate_csv(csv)
  self.assertEqual(report['gc_ui_webview_draw_gl']['samples'],10)
  with self.assertRaises(ValueError):m.parse_aggregate_csv(csv.replace('webview_renderer_cpu_schedule','missing_renderer'))
if __name__=="__main__":unittest.main()
