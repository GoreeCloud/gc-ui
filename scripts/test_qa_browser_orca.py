import unittest
from qa_browser_orca import parse_speech, SPEECH_CHECKS, visit, collect_atspi


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

    def test_required_utterances_from_actual_orca_log_shape(self):
        sample = "\n".join([
            "SPEECH OUTPUT: 'Workspace actions collapsed push button.'",
            "SPEECH OUTPUT: 'Duplicate workspace.'",
            "SPEECH OUTPUT: 'Studio refresh.'",
            "SPEECH OUTPUT: 'Search projects editable combo box.'",
        ])
        self.assertTrue(all(parse_speech(sample).values()))

    def test_rejects_missing_suggestion(self):
        sample = "SPEECH OUTPUT: 'Search projects editable combo box.'"
        self.assertFalse(parse_speech(sample)["forms_suggestion"])
        self.assertEqual(set(parse_speech(sample)), set(SPEECH_CHECKS))

    def test_rejects_log_lines_without_real_speech_marker(self):
        sample = "Not actually generated: 'Duplicate workspace.'"
        self.assertFalse(any(parse_speech(sample).values()))


if __name__ == "__main__":
    unittest.main()
