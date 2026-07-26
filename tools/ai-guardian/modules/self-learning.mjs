// MODUŁ 7 – Self Learning (lokalna pamięć raportów)
import fs from 'fs';
import path from 'path';
import { DATA_DIR, LEARNING_FILE } from '../config.mjs';
import { ensureDir } from '../lib/fs-utils.mjs';

function emptyLearning() {
    return {
        version: 1,
        runs: [],
        recurringTitles: {},
        hotFiles: {},
        regressionHints: [],
        qualityHistory: []
    };
}

export function loadLearning() {
    try {
        if (!fs.existsSync(LEARNING_FILE)) return emptyLearning();
        return { ...emptyLearning(), ...JSON.parse(fs.readFileSync(LEARNING_FILE, 'utf8')) };
    } catch {
        return emptyLearning();
    }
}

export function saveLearning(data) {
    ensureDir(DATA_DIR);
    fs.writeFileSync(LEARNING_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * @param {{ findings: any[], scores: object, reportId: string }} run
 */
export function runSelfLearning(run) {
    const learning = loadLearning();
    const now = new Date().toISOString();

    learning.runs.push({
        id: run.reportId,
        at: now,
        findingCount: run.findings.length,
        scores: run.scores
    });
    if (learning.runs.length > 40) learning.runs = learning.runs.slice(-40);

    for (const f of run.findings) {
        const key = f.title.slice(0, 120);
        learning.recurringTitles[key] = (learning.recurringTitles[key] || 0) + 1;
        for (const file of f.files || []) {
            learning.hotFiles[file] = (learning.hotFiles[file] || 0) + 1;
        }
        if (f.severityity === 'critical' || f.severityity === 'high') {
            learning.regressionHints.push({
                at: now,
                title: f.title,
                files: f.files,
                module: f.module
            });
        }
    }
    if (learning.regressionHints.length > 80) {
        learning.regressionHints = learning.regressionHints.slice(-80);
    }

    learning.qualityHistory.push({ at: now, quality: run.scores.quality, productionReady: run.scores.productionReady });
    if (learning.qualityHistory.length > 40) {
        learning.qualityHistory = learning.qualityHistory.slice(-40);
    }

    const topRecurring = Object.entries(learning.recurringTitles)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([title, count]) => ({ title, count }));

    const topFiles = Object.entries(learning.hotFiles)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([file, count]) => ({ file, count }));

    const ranking = {
        projectQualityTrend: learning.qualityHistory.slice(-8),
        mostProblematicFiles: topFiles,
        recurringIssues: topRecurring,
        lesson: topRecurring[0]
            ? `Najczęściej wraca: „${topRecurring[0].title}” (${topRecurring[0].count}×) – warto mieć checklistę przy PR.`
            : 'Za mało historii – uruchamiaj Guardian regularnie po zmianach.'
    };

    saveLearning(learning);
    return { learning, ranking };
}
