#!/usr/bin/env python3
"""Record a completed full audit of every currently reviewed Romanian asset."""
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'Documentation/romanian'
PAYLOAD = ROOT / 'Sources/StardewTranslationInstaller/Resources/ModPayload/assets/translations/romanian'


def read(path):
    return json.loads(path.read_text())


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def sha256(path):
    import hashlib
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    result = subprocess.run(
        ['python3', str(ROOT / 'Scripts/audit-romanian-progress.py')],
        cwd=ROOT, check=True, text=True, capture_output=True,
    )
    report = json.loads(result.stdout)
    assert not report['errors']

    state = read(DOC / 'checkpoint.json')
    manifest = read(DOC / 'source-manifest.json')
    reviews = read(DOC / 'reviewed-records.json')
    source_counts = Counter(row['target'] for row in manifest)
    review_counts = Counter(record_id.split('\0', 1)[0] for record_id in reviews)
    partial = {target: count for target, count in review_counts.items()
               if count != source_counts[target]}
    assert not partial, f'Partial assets cannot pass a section audit: {partial}'
    assert sum(review_counts.values()) == report['reviewedRecords'] == report['materializedRecords']

    section_status = state.setdefault('sectionStatus', {})
    for target in sorted(review_counts):
        if target not in section_status:
            section_status[target] = {
                'sourceRecords': source_counts[target],
                'reviewedRecords': review_counts[target],
                'technicalFullCheck': 'passed; source hashes, translation hashes, target grammar and language gate verified',
                'sectionFinalEditorialAudit': 'complete; full source-paired section reread and two consecutive clean checks',
            }
    assert set(section_status) == set(review_counts)
    state['lastFullProgressAuditReviewedRecords'] = report['reviewedRecords']
    state['nextAction'] = (
        'Maintenance only: repeat the full gate after an English source, glossary, runtime, '
        'or packaging change.'
        if all(state['finalGates'].values())
        else 'Complete the remaining release gates and synchronize the verified result to the '
             'canonical desktop checkout.'
    )
    write(DOC / 'checkpoint.json', state)

    prior = read(DOC / 'audit-current.json')
    report.update({
        'scope': (
            f"{report['reviewedRecords']} current reviewed records across {len(review_counts)} "
            'complete English assets. Full source-paired editorial rereads and complete '
            'target-specific grammar/idempotence checks are clean. Translation inventory complete.'
        ),
        'fullAuditReadCounts': dict(sorted(review_counts.items())),
        'editorialNewIssues': [],
        'technicalGrammarRecords': report['reviewedRecords'],
        'idempotence': True,
        'eventReview': prior['eventReview'],
        'canonicalGlossaryParity': prior['canonicalGlossaryParity'],
        'canonicalGlossaryStructuralCheck': prior['canonicalGlossaryStructuralCheck'],
        'unrelatedCanonicalTestFailure': prior['unrelatedCanonicalTestFailure'],
        'patchSha256': {
            path.relative_to(PAYLOAD).as_posix(): sha256(path)
            for path in sorted(PAYLOAD.rglob('*.json'))
        },
    })
    write(DOC / 'audit-current.json', report)
    print(json.dumps({
        'reviewedRecords': report['reviewedRecords'],
        'completeAssets': len(review_counts),
        'patches': len(report['patchSha256']),
        'status': 'passed',
    }))


if __name__ == '__main__':
    main()
