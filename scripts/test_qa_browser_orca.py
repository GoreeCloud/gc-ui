import unittest
from qa_browser_orca import parse_speech, SPEECH_CHECKS


class SpeechParserTests(unittest.TestCase):
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
