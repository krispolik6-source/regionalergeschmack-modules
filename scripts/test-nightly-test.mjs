/**
 * Smoke: harmonogram 03:03 + pipeline nightly-test
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

const {
    NIGHTLY_HOUR,
    NIGHTLY_MINUTE,
    localDayStamp,
    nextNightlyRunAt,
    msUntilNextNightly,
    isNightlySlot,
    describeNightlySchedule
} = await import(pathToFileURL(join(ROOT, 'scripts/lib/nightly-schedule.mjs')).href);

assert(NIGHTLY_HOUR === 3, 'hour 3');
assert(NIGHTLY_MINUTE === 3, 'minute 3');
assert(/^\d{4}-\d{2}-\d{2}$/.test(localDayStamp()), 'local day stamp');

const fixed = new Date(2026, 6, 21, 2, 0, 0); // 21 Jul 2026 02:00 local
const next = nextNightlyRunAt(fixed);
assert(next.getHours() === 3 && next.getMinutes() === 3, 'next is 03:03');
assert(next.getDate() === 21, 'same day when before 03:03');

const after = new Date(2026, 6, 21, 3, 4, 0);
const next2 = nextNightlyRunAt(after);
assert(next2.getDate() === 22, 'next day when after 03:03');
assert(msUntilNextNightly(fixed) > 0, 'ms until > 0');
assert(!isNightlySlot(fixed), '02:00 not slot');
assert(isNightlySlot(new Date(2026, 6, 21, 3, 3, 15)), '03:03 is slot');

const desc = describeNightlySchedule(fixed);
assert(desc.hour === 3 && desc.minute === 3, 'describe hour/minute');
assert(typeof desc.timezone === 'string', 'timezone string');

const smtp = readFileSync(join(ROOT, 'scripts/lib/developer-smtp.mjs'), 'utf8');
assert(smtp.includes('nightlyMailSubject'), 'smtp has nightlyMailSubject');
assert(smtp.includes('Raport nocny – Regionaler Smak'), 'nightly subject pattern');

const cli = readFileSync(join(ROOT, 'scripts/nightly-test.mjs'), 'utf8');
assert(cli.includes('collectHealth'), 'runs Health');
assert(cli.includes('collectSelfHeal'), 'runs SelfHeal');
assert(cli.includes('collectGuardian'), 'runs Guardian');
assert(cli.includes('collectPerformance'), 'runs Performance');
assert(cli.includes('nightlyMailSubject'), 'uses nightly subject');
assert(cli.includes('krispolik6@gmail.com') || cli.includes('OWNER_DEVELOPER_EMAIL'), 'owner email');
assert(cli.includes('sleepUntilNextNightly'), 'daemon schedule');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts['nightly-test'], 'npm run nightly-test');
assert(pkg.scripts['nightly-test:daemon'], 'npm run nightly-test:daemon');

const wf = join(ROOT, '.github/workflows/nightly-test.yml');
assert(existsSync(wf), 'GitHub workflow exists');
const yml = readFileSync(wf, 'utf8');
assert(yml.includes("cron: '3 1 * * *'") || yml.includes('cron:'), 'workflow has cron');
assert(yml.includes('Europe/Warsaw') || yml.includes('TZ:'), 'workflow TZ Warsaw');
assert(yml.includes('nightly-test'), 'workflow runs nightly-test');

// Dry run bez SMTP (--no-send) – szybki smoke pipeline
console.log('\n— dry run nightly-test --no-send —');
const dry = spawnSync(
    process.execPath,
    [join(ROOT, 'scripts/nightly-test.mjs'), '--no-send'],
    { cwd: ROOT, encoding: 'utf8', timeout: 180_000 }
);
assert(dry.status === 0, `dry run exit 0 (got ${dry.status})`);
if (dry.status !== 0) {
    console.error((dry.stderr || dry.stdout || '').slice(-2000));
}
assert(existsSync(join(ROOT, 'docs/nightly/latest.md')), 'wrote docs/nightly/latest.md');
assert(existsSync(join(ROOT, 'docs/nightly/latest.json')), 'wrote docs/nightly/latest.json');
if (existsSync(join(ROOT, 'docs/nightly/latest.md'))) {
    const latest = readFileSync(join(ROOT, 'docs/nightly/latest.md'), 'utf8');
    assert(latest.includes('Raport nocny – Regionaler Smak'), 'report title');
    assert(latest.includes('HEALTH'), 'report has HEALTH');
    assert(latest.includes('SELF-HEAL'), 'report has SELF-HEAL');
    assert(latest.includes('GUARDIAN'), 'report has GUARDIAN');
    assert(latest.includes('PERFORMANCE'), 'report has PERFORMANCE');
}

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nAll nightly-test checks passed.');
