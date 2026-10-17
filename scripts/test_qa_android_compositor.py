import importlib.util
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location("gc_sf",Path(__file__).parent/"qa-android-compositor.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class SurfaceTests(unittest.TestCase):
    def test_selects_only_gc_drawable_surface(self):
        listing="RequestedLayerState{OtherApp#10}\nRequestedLayerState{ActivityRecordInputSink com.goreecloud.gcui.preview/.GCNativeActivity#7}\nRequestedLayerState{com.goreecloud.gcui.preview/com.goreecloud.gcui.preview.GCNativeActivity#42}"
        listing += "\nRequestedLayerState{fa1230 com.goreecloud.gcui.preview/com.goreecloud.gcui.preview.GCNativeActivity#41}"
        self.assertEqual(m.gc_layer(listing),"com.goreecloud.gcui.preview/com.goreecloud.gcui.preview.GCNativeActivity#42")
        with self.assertRaises(ValueError):m.gc_layer("no surface")

    def test_vsync_and_intervals_are_present_timestamps_only(self):
        rows=["11111111"]
        for i in range(8):
            rows.append(str(1000000000+i*11111111)+" "+str(1000050000+i*11111111)+" "+str(1000000100+i*11111111))
        sample=m.presentation_stats("\n".join(rows))
        self.assertEqual(sample["presented_frames"],8)
        self.assertAlmostEqual(sample["presentation_interval_median_ms"],11.11,delta=.01)
        self.assertEqual(sample["intervals_over_1_5_vsync_pct"],0.0)
        self.assertNotIn("gpu_duration_ms",sample)

    def test_excludes_missing_and_invalid_rows(self):
        with self.assertRaises(ValueError):m.presentation_stats("")
        with self.assertRaises(ValueError):m.presentation_stats("100\n1 2 3")
        with self.assertRaises(ValueError):m.presentation_stats("11111111\n0 0 0\n1 9223372036854775807 1")

    def test_mode_marker_rejects_old_runs(self):
        log='GCUI.QA: older\nGCUI.Perf: resourceMode="conserve"\nGCUI.QA: current\nGCUI.Perf: resourceMode="normal"\n'
        self.assertTrue(m.verified_mode(log,"current","normal"))
        self.assertFalse(m.verified_mode(log,"current","conserve"))
        self.assertFalse(m.verified_mode(log,"missing","normal"))

    def test_summary_is_descriptive(self):
        rows=[{"mode":"normal","surface_presentation":{"presented_frames":100,"presentation_interval_median_ms":11,"presentation_interval_p90_ms":22,"intervals_over_1_5_vsync_pct":10}},
              {"mode":"conserve","surface_presentation":{"presented_frames":98,"presentation_interval_median_ms":12,"presentation_interval_p90_ms":24,"intervals_over_1_5_vsync_pct":20}}]
        s=m.summarize(rows)
        self.assertEqual(s["normal"]["runs"],1)
        self.assertEqual(s["conserve"]["presentation_interval_p90_ms_median"],24)
        self.assertNotIn("battery_savings",s["normal"])

if __name__=="__main__":unittest.main()
