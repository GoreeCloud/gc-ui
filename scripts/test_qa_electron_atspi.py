import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location("atspi",Path(__file__).parent/"qa-electron-atspi.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
class AtspiTest(unittest.TestCase):
 def test_all_named_controls_are_required(self):
  nodes=list(m.REQUIRED)+[("push button","Switch to dark appearance")]
  x=m.verify_tree(nodes)
  self.assertTrue(x["all_required_present"])
  self.assertEqual(x["required_role_name_pairs"],10)
 def test_unlabelled_control_fails(self):
  nodes=[item for item in m.REQUIRED if item[1]!="Platform profile"]
  nodes.append(("push button","Switch to dark appearance"))
  with self.assertRaises(ValueError):m.verify_tree(nodes)
 def test_missing_appearance_fails(self):
  with self.assertRaises(ValueError):m.verify_tree(list(m.REQUIRED))
if __name__=="__main__":unittest.main()
