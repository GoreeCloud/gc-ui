"""Orca generated-speech event parser tests (no screen reader required)."""
import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location("orcaqa",Path(__file__).parent/"qa-orca-speech.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
class OrcaOutputTest(unittest.TestCase):
 def test_all_control_names_roles_and_values(self):
  spoken=[v if k!="appearance_role" else "Switch to dark appearance push button"
          for k,v in m.REQUIRED.items()]
  data="\n".join("18:12:00 - SPEECH OUTPUT: '"+value+".'{'established': False}"
                 for value in spoken)
  parsed=m.parse_speech_output(data)
  self.assertTrue(parsed["all_required_generated"])
  self.assertEqual(len(parsed["matched_utterances"]),4)
 def test_opposite_appearance_label_is_supported(self):
  data="\n".join("SPEECH OUTPUT: '"+(v if k!="appearance_role" else "Switch to light appearance push button")+".'"
                 for k,v in m.REQUIRED.items())
  self.assertTrue(m.parse_speech_output(data)["all_required_generated"])
 def test_missing_state_is_not_a_pass(self):
  data="SPEECH OUTPUT: 'Platform profile combo box.'{'established': False}"
  parsed=m.parse_speech_output(data)
  self.assertFalse(parsed["all_required_generated"])
  self.assertFalse(parsed["checks"]["conservation_role_state"])
 def test_untrusted_non_speech_strings_not_counted(self):
  data="SPEECH GENERATOR: Preview resource conservation check box not checked"
  self.assertFalse(m.parse_speech_output(data)["checks"]["conservation_role_state"])
if __name__=="__main__":unittest.main()
