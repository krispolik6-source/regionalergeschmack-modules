import { isOpenNow, getProducerOpenStatus } from '../js/data/openingHours.js';

let failed = 0;
function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

ok(isOpenNow('24/7') === true, '24/7 open');

// Monday 12:00
const monNoon = new Date('2026-07-13T12:00:00');
ok(monNoon.getDay() === 1, 'fixture monday');
ok(isOpenNow('Mo-Fr 09:00-18:00', monNoon) === true, 'Mo-Fr open at noon');
ok(isOpenNow('Mo-Fr 09:00-18:00', new Date('2026-07-13T20:00:00')) === false, 'Mo-Fr closed evening');
ok(isOpenNow('Mo-Fr 09:00-18:00', new Date('2026-07-12T12:00:00')) === false, 'Mo-Fr closed Sunday');

ok(isOpenNow('Sa,Su 10:00-14:00', new Date('2026-07-12T12:00:00')) === true, 'weekend open');
ok(isOpenNow('Sa,Su 10:00-14:00', monNoon) === false, 'weekend closed Mon');

const status = getProducerOpenStatus({ openingHours: 'Mo-Su 00:00-24:00' }, monNoon);
ok(status.known && status.isOpen === true, 'status known open');

const unknown = getProducerOpenStatus({ openingHours: '' });
ok(!unknown.known, 'empty hours unknown');

console.log(failed ? `RESULT FAIL ${failed}` : 'RESULT PASS');
process.exit(failed ? 1 : 0);
