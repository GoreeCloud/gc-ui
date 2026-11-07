import unittest
from pathlib import Path
import tempfile
from qa_browser_orca import (parse_speech, SPEECH_CHECKS, visit,
                             collect_atspi, release_speech_gates)


class SpeechParserTests(unittest.TestCase):
    def test_atspi_transient_null_children_do_not_crash_tree_walk(self):
        class Node:
            def __init__(self, name, role, children=()):
                self.name, self.role, self.children = name, role, children

            def get_name(self):
                return self.name

            def get_role_name(self):
                return self.role

            def get_child_count(self):
                return len(self.children)

            def get_child_at_index(self, index):
                return self.children[index]

        found = set()
        visit(None, found)
        visit(Node("chrome for testing", "application", (
            None, Node("Workspace actions", "push button"), None
        )), found)
        self.assertIn(("Workspace actions", "push button"), found)

        class Desktop:
            def get_child_count(self):
                return 2

            def get_child_at_index(self, index):
                if index == 0:
                    return None
                return Node("chromium", "application", (
                    None, Node("Duplicate workspace", "menu item")
                ))

        class Registry:
            @staticmethod
            def get_desktop(_):
                return Desktop()

        self.assertIn(("Duplicate workspace", "menu item"), collect_atspi(Registry))

    def test_atspi_toggle_exposes_both_pressed_states(self):
        class State:
            def __init__(self, pressed):
                self.pressed = pressed

            def contains(self, token):
                return token == "pressed" and self.pressed

        class Node:
            def __init__(self, pressed):
                self.pressed = pressed

            def get_name(self):
                return "Reveal sample passphrase"

            def get_role_name(self):
                return "toggle button"

            def get_state_set(self):
                return State(self.pressed)

            def get_child_count(self):
                return 0

        seen, roles = set(), set()
        for pressed in (False, True, False):
            visit(Node(pressed), roles, pressed_states=seen, pressed_state="pressed")
        self.assertEqual(seen, {True, False})
        self.assertIn(("Reveal sample passphrase", "toggle button"), roles)

    def test_required_utterances_from_actual_orca_log_shape(self):
        sample = "\n".join([
            "SPEECH OUTPUT: 'Workspace actions collapsed push button.'",
            "SPEECH OUTPUT: 'Duplicate workspace.'",
            "SPEECH OUTPUT: 'Studio refresh.'",
            "SPEECH OUTPUT: 'Search projects editable combo box.'",
            "SPEECH OUTPUT: 'Reveal sample passphrase toggle button not pressed.'",
        ])
        self.assertTrue(all(parse_speech(sample).values()))

    def test_rejects_missing_password_reveal_utterance(self):
        sample = "SPEECH OUTPUT: 'Search projects editable combo box.'"
        self.assertFalse(parse_speech(sample)["password_reveal_control"])

    def test_speech_gate_rejects_unspoken_and_unmarked_announcements(self):
        with tempfile.TemporaryDirectory() as tmp:
            paths = {
                "forms_combobox": Path(tmp) / "forms.flag",
                "password_reveal_control": Path(tmp) / "reveal.flag",
            }
            release_speech_gates("Browser DOM says Reveal sample passphrase", paths)
            self.assertFalse(any(path.exists() for path in paths.values()))
            release_speech_gates(
                "SPEECH OUTPUT: 'Search projects editable combo box.'", paths
            )
            self.assertTrue(paths["forms_combobox"].exists())
            self.assertFalse(paths["password_reveal_control"].exists())
            release_speech_gates(
                "SPEECH OUTPUT: 'Reveal sample passphrase toggle button not pressed.'",
                paths,
            )
            self.assertTrue(all(path.exists() for path in paths.values()))
            with self.assertRaises(KeyError):
                release_speech_gates("", {"unrecognized_gate": Path(tmp) / "bad.flag"})
            self.assertFalse((Path(tmp) / "bad.flag").exists())

    def test_rejects_missing_suggestion(self):
        sample = "SPEECH OUTPUT: 'Search projects editable combo box.'"
        self.assertFalse(parse_speech(sample)["forms_suggestion"])
        self.assertEqual(set(parse_speech(sample)), set(SPEECH_CHECKS))

    def test_rejects_log_lines_without_real_speech_marker(self):
        sample = "Not actually generated: 'Duplicate workspace.'"
        self.assertFalse(any(parse_speech(sample).values()))


if __name__ == "__main__":
    unittest.main()
