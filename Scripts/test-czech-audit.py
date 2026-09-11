#!/usr/bin/env python3
"""Behavioral regression checks; all writable fixtures live in temporary roots."""
import contextlib
import copy
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import czech_audit as m


class AuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.doc = self.root / 'Documentation/czech'
        (self.doc / 'batches').mkdir(parents=True)
        (self.root / 'Documentation/glossary').mkdir()
        self.glossary = self.root / 'Documentation/glossary/glossary.cs.json'
        self.glossary.write_text('{"cs": {"term": {"term": "A", "meaning": "B"}}}')
        self.rows = [{'target': 'Strings/Test', 'key': str(i), 'field': None,
                      'source': 'Source ' + str(i) + 'x' * 200,
                      'translation': 'Translation ' + str(i)} for i in range(6)]
        self.batch = self.doc / 'batches/001.json'
        self.flush()
        self.manifest()
        self.limit = patch.object(m, 'MAX_CHARS', 750)
        self.limit.start()
        self.addCleanup(self.limit.stop)

    def flush(self):
        for row in self.rows:
            row['translationSHA256'] = m.digest(row['translation'])
        m.write(self.batch, {'id': '001', 'locale': 'cs', 'rows': self.rows})

    def manifest(self):
        m.write(self.doc / 'source-manifest.json', {'count': len(self.rows), 'rows': [
            dict(target=r['target'], key=r['key'], field=r['field'], sourceSHA256=m.digest(r['source'])) for r in self.rows]})

    def audit(self):
        return m.Audit(self.root)

    def approve_editing(self):
        a = self.audit()
        a.approve(a.receipt(list(range(len(a.state['chunks'])))), 'Read each original and translation.')
        a.save()

    def clean_start(self):
        self.approve_editing()
        a = self.audit()
        a.start_clean()
        a.save()

    def cli(self, *args):
        with contextlib.redirect_stdout(io.StringIO()) as out:
            m.main([*args, '--root', str(self.root)])
        return out.getvalue()

    def test_status_and_show_never_create_or_change_ledger(self):
        before = {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.cli('status')
        self.cli('show', '--chunks', '1-3')
        after = {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertEqual(before, after)
        self.clean_start()
        ledger = self.audit().path.read_bytes()
        self.rows[0]['translation'] += ' changed'; self.flush()
        status = json.loads(self.cli('status'))
        self.assertTrue(status['cleanPassInvalidated'])
        self.assertEqual(ledger, self.audit().path.read_bytes())

    def test_translation_length_does_not_move_chunks_or_erase_other_rows(self):
        self.approve_editing()
        a = self.audit(); chunks = copy.deepcopy(a.state['chunks'])
        self.rows[0]['translation'] += 'changed ' * 10000; self.flush()
        b = self.audit()
        self.assertEqual(chunks, b.state['chunks'])
        self.assertEqual(5, len(b.reviewed()))
        self.assertEqual(0, b.clean_count())

    def test_migration_retains_hash_verified_editing_only_and_backup(self):
        a = self.audit(); legacy = m.split_rows(a.rows, legacy=True)
        old = {'schema': 1, 'chunkCount': len(legacy), 'translationSetSHA256': 'legacy',
               'cleanFullAudits': 1, 'passes': [{'number': 1, 'status': 'clean', 'chunks': {
                   '0': {'chunkSHA256': m.legacy_chunk_hash(legacy[0]), 'reviewedAt': 'then', 'reviewNote': 'read'}}}],
               'invalidatedPasses': [{'reviewedChunks': 4}]}
        m.write(a.path, old)
        m.write(self.doc / 'checkpoint.json', {'glossarySHA256': a.glossary_hash, 'sourceManifestSHA256': a.manifest_hash})
        before = a.path.read_bytes()
        a = self.audit()
        self.assertEqual(len(legacy[0]), len(a.reviewed()))
        self.assertEqual(0, a.clean_count())
        self.assertEqual(before, a.path.read_bytes())
        a.save()
        backups = list(self.doc.glob('full-audit-state.schema1.*.json'))
        self.assertEqual(1, len(backups))
        self.assertEqual(before, backups[0].read_bytes())
        self.assertFalse(self.audit().migration)
        self.audit().save()
        self.assertEqual(1, len(list(self.doc.glob('full-audit-state.schema1.*.json'))))

    def test_migration_rejects_unverifiable_context(self):
        a = self.audit(); chunks = m.split_rows(a.rows, legacy=True)
        m.write(a.path, {'schema': 1, 'chunkCount': len(chunks), 'passes': [{'chunks': {'0': {'chunkSHA256': m.legacy_chunk_hash(chunks[0])}}}]})
        self.assertEqual(0, len(self.audit().reviewed()))

    def test_batch_approval_rejects_stale_content_atomically(self):
        a = self.audit(); receipt = a.receipt([0, 1])
        self.rows[1]['translation'] += ' change'; self.flush()
        b = self.audit(); before = copy.deepcopy(b.state)
        with self.assertRaisesRegex(ValueError, 'content changed'):
            b.approve(receipt, 'reviewed')
        self.assertEqual(before, b.state)

    def test_receipt_from_unaffected_editing_chunks_survives_other_change(self):
        a = self.audit(); receipt = a.receipt([0])
        self.rows[-1]['translation'] += ' change'; self.flush()
        b = self.audit(); b.approve(receipt, 'Reviewed unchanged block'); b.save()
        self.assertEqual(len(a.state['chunks'][0]), len(self.audit().reviewed()))

    def test_two_distinct_clean_passes_and_no_editing_shortcut(self):
        a = self.audit()
        with self.assertRaises(ValueError): a.start_clean()
        self.approve_editing()
        self.assertEqual(0, self.audit().clean_count())
        a = self.audit(); a.start_clean(); a.save()
        a = self.audit(); receipt1 = a.receipt(list(range(len(a.state['chunks']))))
        with self.assertRaisesRegex(ValueError, 'no-findings'): a.approve(receipt1, 'read')
        a.approve(receipt1, 'All entries read; no findings.', no_findings=True); a.save()
        b = self.audit(); self.assertEqual(1, b.clean_count())
        with self.assertRaisesRegex(ValueError, 'another review phase/pass'):
            b.approve(receipt1, 'reuse', no_findings=True)
        receipt2 = b.receipt(list(range(len(b.state['chunks']))))
        self.assertNotEqual(receipt1['passId'], receipt2['passId'])
        b.approve(receipt2, 'Independent second full pass, no findings.', no_findings=True); b.save()
        self.assertEqual(2, self.audit().clean_count())
        self.rows[0]['translation'] += ' final correction'; self.flush()
        self.assertEqual(0, self.audit().clean_count())
        self.assertEqual(5, len(self.audit().reviewed()))

    def test_clean_receipt_invalid_after_change_outside_selected_chunk(self):
        self.clean_start(); a = self.audit(); receipt = a.receipt([0])
        self.rows[-1]['translation'] += ' change'; self.flush()
        b = self.audit()
        with self.assertRaises(ValueError): b.approve(receipt, 'stale', no_findings=True)
        self.assertEqual(0, b.clean_count())

    def test_glossary_change_requires_new_review(self):
        self.clean_start()
        self.glossary.write_text('{"cs": {"different": {"term": "C", "meaning": "D"}}}')
        a = self.audit(); self.assertEqual(0, len(a.reviewed())); self.assertIsNone(a.active_pass())

    def test_findings_cannot_be_counted_as_clean(self):
        self.clean_start()
        self.cli('record-findings', '--note', 'A confirmed omission to fix.')
        a = self.audit(); self.assertIsNone(a.active_pass())
        with self.assertRaises(ValueError): a.start_clean()
        self.cli('resolve-findings', '--note', 'Correction applied and context rechecked.')
        self.assertEqual(0, self.audit().clean_count())

    def test_source_and_translation_hashes_and_duplicate_ids_checked(self):
        self.rows[0]['source'] += ' changed'; self.flush()
        with self.assertRaisesRegex(ValueError, 'Source differs'): self.audit()
        self.manifest()
        data = m.read(self.batch); data['rows'][0]['translation'] += ' unapproved'; m.write(self.batch, data)
        with self.assertRaisesRegex(ValueError, 'Stale translation hash'): self.audit()
        self.flush(); self.rows.append(copy.deepcopy(self.rows[0])); self.flush()
        with self.assertRaisesRegex(ValueError, 'duplicate'): self.audit()

    def test_concurrent_ledger_or_input_update_is_not_overwritten(self):
        a, b = self.audit(), self.audit(); a.save()
        with self.assertRaisesRegex(ValueError, 'concurrently'): b.save()
        a = self.audit(); before = a.path.read_bytes()
        self.rows[0]['translation'] += ' changed'; self.flush()
        with self.assertRaisesRegex(ValueError, 'inputs changed'): a.save()
        self.assertEqual(before, a.path.read_bytes())

    def test_cli_receipt_and_batch_approval(self):
        receipt = self.doc / 'receipt.json'
        self.cli('show', '--chunks', '1-3', '--receipt', str(receipt))
        self.cli('approve', '--receipt', str(receipt), '--note', 'Read every displayed row.')
        self.assertEqual(3, len(self.audit().reviewed()))
        with self.assertRaises(SystemExit): self.cli('approve', '--chunk', '4', '--note', 'blind')


if __name__ == '__main__':
    unittest.main()
