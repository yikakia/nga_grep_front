const INDICATOR_NAME_MAP = {
    ma5: 'MA5',
    ma10: 'MA10',
    boll: 'BOLL'
};

function sanitizeFileNamePart(value = '') {
    return String(value)
        .trim()
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function normalizeLocalDateTimeForFileName(dateTimeValue) {
    if (!dateTimeValue) return 'unknown';
    return sanitizeFileNamePart(dateTimeValue.replace('T', '_').replace(':', '-').replace(/:/g, '-'));
}

function getIndicatorName(indicator) {
    if (!indicator) return '';
    return INDICATOR_NAME_MAP[indicator] || String(indicator).toUpperCase();
}

function buildFileName(meta = {}) {
    const startPart = normalizeLocalDateTimeForFileName(meta.startLocal);
    const endPart = normalizeLocalDateTimeForFileName(meta.endLocal);
    const intervalPart = sanitizeFileNamePart(meta.timeInterval || 'unknown');
    const indicatorName = getIndicatorName(meta.indicator);

    const baseName = `nga-timeseries_${startPart}_${endPart}_${intervalPart}`;
    const withIndicator = indicatorName ? `${baseName}_${sanitizeFileNamePart(indicatorName)}` : baseName;
    return `${withIndicator}.csv`;
}

function escapeCsvCell(value) {
    if (value === null || value === undefined) return '';
    const raw = String(value);
    if (/[",\n\r]/.test(raw)) {
        return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
}

function buildCsvText(labels = [], datasets = []) {
    const header = ['时间(本地)', ...datasets.map((dataset) => dataset.label || '未命名序列')];
    const rows = [header];

    for (let i = 0; i < labels.length; i += 1) {
        const row = [labels[i]];
        for (const dataset of datasets) {
            const value = Array.isArray(dataset.data) ? dataset.data[i] : '';
            row.push(value ?? '');
        }
        rows.push(row);
    }

    return rows
        .map((row) => row.map(escapeCsvCell).join(','))
        .join('\n');
}

function triggerDownload(fileName, csvText) {
    const blob = new Blob([`\uFEFF${csvText}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    try {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    } finally {
        URL.revokeObjectURL(url);
    }
}

export function exportChartDataToCsv(payload = {}) {
    const labels = Array.isArray(payload.labels) ? payload.labels : [];
    const datasets = Array.isArray(payload.datasets) ? payload.datasets : [];

    if (labels.length === 0 || datasets.length === 0) {
        throw new Error('暂无可导出的图表数据');
    }

    const csvText = buildCsvText(labels, datasets);
    const fileName = buildFileName(payload.meta || {});
    triggerDownload(fileName, csvText);

    return {
        fileName,
        rowCount: labels.length,
        columnCount: datasets.length + 1
    };
}
