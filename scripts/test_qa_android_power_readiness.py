import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location("power",Path(__file__).parent/"qa-android-power-readiness.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
def battery(usb=False,charging=3,level=62,temp=300):
 return (f"USB powered: {str(usb).lower()}\nAC powered: false\nWireless powered: false\n"
         f"Dock powered: false\nstatus: {charging}\nlevel: {level}\ntemperature: {temp}\n")
class PowerReadiness(unittest.TestCase):
 def test_usb_stays_blocked_even_if_charge_status_claims_discharging(self):
  v=m.assess_battery(m.parse_battery(battery(usb=True)))
  self.assertFalse(v["ready_for_disconnected_workload"])
  self.assertIn("external-power-connected",v["blocking_reasons"])
 def test_charging_stays_blocked_without_external_power(self):
  v=m.assess_battery(m.parse_battery(battery(charging=2)))
  self.assertFalse(v["ready_for_disconnected_workload"])
 def test_unknown_battery_fails_closed(self):
  with self.assertRaises(ValueError):m.parse_battery("level: 50")
 def test_warm_low_battery_is_not_comparable(self):
  v=m.assess_battery(m.parse_battery(battery(level=18,temp=399)))
  self.assertIn("battery-level-outside-controlled-window",v["blocking_reasons"])
  self.assertIn("battery-temperature-outside-controlled-window",v["blocking_reasons"])
 def test_valid_unplugged_is_ready_not_measured(self):
  v=m.parse_battery(battery())
  self.assertTrue(m.assess_battery(v)["ready_for_disconnected_workload"])
  report=m.inspect([{"model":"Phone","api":"35","is_emulator":False,"battery":v}])
  self.assertFalse(report["energy_consumption_measured"])
  self.assertFalse(report["second_physical_device_verified"])
 def test_only_real_devices_count_and_serials_are_absent(self):
  devices=m.parse_adb_devices("List of devices attached\nabc123               device usb:1 model:Phone\nemulator-5554\tdevice product:emu\nzz\toffline\n")
  self.assertEqual(devices,["abc123","emulator-5554"])
  report=m.inspect([{"model":"Pixel A","api":"35","is_emulator":False,"battery":None},
                    {"model":"Emu","api":"36","is_emulator":True,"battery":None}])
  self.assertEqual(report["physical_device_count"],1)
  self.assertFalse(report["second_physical_device_verified"])
if __name__=="__main__":unittest.main()
