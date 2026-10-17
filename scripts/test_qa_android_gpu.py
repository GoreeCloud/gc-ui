import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location("hwui",Path(__file__).parent/"qa-android-gpu.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
class HWUITest(unittest.TestCase):
 def test_bucket_percentiles(self):
  raw="Total frames rendered: 20\nGPU HISTOGRAM: 1ms=3 2ms=9 3ms=6 10ms=1 20ms=1 4950ms=0\nPipeline=Skia (OpenGL)\n"
  x=m.parse_gpu_histogram(raw)
  self.assertEqual(x["samples"],20)
  self.assertEqual(x["p50_gpu_bucket_ms"],2)
  self.assertEqual(x["p90_gpu_bucket_ms"],3)
  self.assertEqual(x["p95_gpu_bucket_ms"],10)
  self.assertEqual(x["buckets_over_16ms_pct"],5.0)
  self.assertIn("Skia",x["pipeline"])
 def test_missing_or_empty_histogram_fails(self):
  for x in ["","GPU HISTOGRAM: 1ms=0 2ms=0 3ms=0 4ms=0","GPU HISTOGRAM: 1ms=9"]:
   with self.assertRaises(ValueError):m.parse_gpu_histogram(x)
 def test_outlier_is_visible_not_ignored(self):
  x=m.parse_gpu_histogram("GPU HISTOGRAM: 1ms=8 2ms=1 3ms=0 4ms=0 4950ms=1")
  self.assertEqual(x["p95_gpu_bucket_ms"],4950)
  self.assertEqual(x["extreme_4950ms_bucket_count"],1)
 def test_descriptive_summary_does_not_claim_energy(self):
  x=m.summary([{"mode":"normal","hwui_gpu_histogram":{"samples":20,"p50_gpu_bucket_ms":2,"p90_gpu_bucket_ms":3,"p95_gpu_bucket_ms":4,"buckets_over_16ms_pct":5}}])
  self.assertEqual(x["normal"]["runs"],1)
  self.assertNotIn("energy_savings_pct",x["normal"])
if __name__=="__main__":unittest.main()
