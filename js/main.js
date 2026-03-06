import { ThemeManager } from './theme.js';
import { ChartManager } from './chart.js';
import { dateUtils } from './dateUtils.js';
import { api } from './api.js';
import { IndicatorHandler } from './indicators.js';
import { exportChartDataToCsv } from './exportCsv.js';

class App {
    constructor() {
        this.initElements();
        this.initManagers();
        this.setupEventListeners();
        this.initDefaultValues();
        this.fetchInitialData();
    }

    initElements() {
        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');
        this.fetchDataButton = document.getElementById('fetchData');
        this.exportCsvButton = document.getElementById('exportCsv');
        this.timeIntervalSelect = document.getElementById('timeInterval');
        this.rangeSelect = document.getElementById('rangeSelect');
        this.compareOffsetInput = document.getElementById('compareOffset');
        this.compareUnitSelect = document.getElementById('compareUnit');
        this.indicatorSelect = document.getElementById('indicatorSelect');
        this.toastEl = document.getElementById('toast');
        this.toastTimer = null;
        this.exportPayload = null;
        this.setExportButtonDisabled(true);
    }

    initManagers() {
        this.themeManager = new ThemeManager();
        this.chartManager = new ChartManager(
            document.getElementById('timeSeriesChart').getContext('2d')
        );
    }

    setupEventListeners() {
        this.rangeSelect.addEventListener('change', () => {
            dateUtils.setDateRange(this.startDateInput, this.endDateInput, this.rangeSelect.value);
        });

        this.indicatorSelect.addEventListener('change', () => {
            const value = this.indicatorSelect.value;
            const disableCompare = value !== "";
            this.compareOffsetInput.disabled = disableCompare;
            this.compareUnitSelect.disabled = disableCompare;
        });

        this.fetchDataButton.addEventListener('click', () => this.handleFetchData());
        if (this.exportCsvButton) {
            this.exportCsvButton.addEventListener('click', () => this.handleExportCsv());
        }
    }

    async handleFetchData() {
        const startDateUTC = dateUtils.toUTC(this.startDateInput.value);
        const endDateUTC = dateUtils.toUTC(this.endDateInput.value);
        const timeInterval = this.timeIntervalSelect.value;
        const compareOffset = parseInt(this.compareOffsetInput.value) || 0;
        const compareUnit = this.compareUnitSelect.value;
        const selectedIndicator = this.indicatorSelect.value;

        if (!this.validateInputs(startDateUTC, endDateUTC)) return;

        const compareResult = await this.getCompareResp(startDateUTC, endDateUTC, compareOffset, compareUnit, timeInterval, selectedIndicator);
        
        try {
            this.setFetchButtonLoading(true);

            const [currentResp, compareResp] = await Promise.all([
                api.fetchData(startDateUTC, endDateUTC, timeInterval, selectedIndicator),
                compareResult,
                // this.getCompareResp(startDateUTC, endDateUTC, compareOffset, compareUnit, timeInterval, selectedIndicator)
            ]);

            const chartData = this.updateChartData(currentResp, compareResp, compareOffset, compareUnit, selectedIndicator);
            this.setExportPayload(chartData, {
                startLocal: this.startDateInput.value,
                endLocal: this.endDateInput.value,
                timeInterval,
                indicator: selectedIndicator
            });
        } catch (err) {
            console.error("数据获取或处理失败:", err);
            this.showToast(`获取数据失败: ${err.message}。请检查网络或控制台日志。`, 'error');
            this.clearExportPayload();
            this.chartManager.destroy();
        } finally {
            this.setFetchButtonLoading(false);
        }
    }

    validateInputs(startDateUTC, endDateUTC) {
        if (!startDateUTC || !endDateUTC) {
            this.showToast("请输入有效的开始和结束时间！", 'error');
            return false;
        }
        if (moment(this.endDateInput.value).isBefore(moment(this.startDateInput.value))) {
            this.showToast("结束时间不能早于开始时间！", 'error');
            return false;
        }
        return true;
    }

    async getCompareResp(startDateUTC, endDateUTC, compareOffset, compareUnit, timeInterval, selectedIndicator) {
        if (compareOffset > 0 && !selectedIndicator) {
            const startMomentUTC = moment.utc(startDateUTC);
            const endMomentUTC = moment.utc(endDateUTC);
            if (startMomentUTC.isValid() && endMomentUTC.isValid()) {
                const startCompareUTC = startMomentUTC.subtract(compareOffset, compareUnit).format('YYYY-MM-DD HH:mm');
                const endCompareUTC = endMomentUTC.subtract(compareOffset, compareUnit).format('YYYY-MM-DD HH:mm');
                return api.fetchData(startCompareUTC, endCompareUTC, timeInterval, null);
            }
        }
        return Promise.resolve(null);
    }

    getCssVar(name, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    }

    getChartTheme() {
        return {
            series: {
                primary: this.getCssVar('--series-primary', '#38bdf8'),
                compare: this.getCssVar('--series-compare', '#fb7185'),
                ma5: this.getCssVar('--series-ma5', '#a78bfa'),
                ma10: this.getCssVar('--series-ma10', '#818cf8'),
                bollUpper: this.getCssVar('--series-boll-upper', '#22d3ee'),
                bollLower: this.getCssVar('--series-boll-lower', '#818cf8'),
                bollMiddle: this.getCssVar('--series-boll-middle', '#94a3b8'),
                bollFill: this.getCssVar('--series-boll-fill', 'rgba(56, 189, 248, 0.13)')
            },
            chart: {
                grid: this.getCssVar('--chart-grid', 'rgba(148, 163, 184, 0.18)'),
                axis: this.getCssVar('--chart-axis', '#94a3b8'),
                legend: this.getCssVar('--chart-legend', '#cbd5e1'),
                tooltipBg: this.getCssVar('--chart-tooltip-bg', 'rgba(15, 23, 42, 0.96)'),
                tooltipText: this.getCssVar('--chart-tooltip-text', '#e2e8f0'),
                tooltipBorder: this.getCssVar('--chart-tooltip-border', '#334155')
            }
        };
    }

    updateChartData(currentResp, compareResp, compareOffset, compareUnit, selectedIndicator) {
        if (!currentResp || !currentResp['data'] || !Array.isArray(currentResp['data'])) {
            throw new Error("主数据格式无效");
        }
        const currentData = currentResp['data'];

        const datasets = [];
        const labels = currentData.map(item => dateUtils.fromUTC(item.timestamp));
        const chartTheme = this.getChartTheme();

        // 添加主数据
        datasets.push({
            label: '当前发帖量',
            data: currentData.map(item => item.value),
            borderColor: chartTheme.series.primary,
            borderWidth: 2.4,
            tension: 0.28,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHitRadius: 12
        });

        // 添加技术指标
        if (selectedIndicator && currentData[0] && selectedIndicator in currentData[0]) {
            IndicatorHandler.process(selectedIndicator, datasets, currentData, chartTheme);
        }

        // 添加对比数据
        if (compareResp && compareResp['data'] && Array.isArray(compareResp['data']) && compareResp['data'].length > 0) {
            this.addCompareDataset(datasets, compareResp['data'], currentData, compareOffset, compareUnit, chartTheme);
        }

        this.chartManager.updateChart(labels, datasets, chartTheme.chart);
        return { labels, datasets };
    }

    addCompareDataset(datasets, compareData, currentData, compareOffset, compareUnit, chartTheme) {
        if (compareData.length === currentData.length) {
            datasets.push({
                label: `对比发帖量 (${compareOffset}${compareUnit === 'days' ? '天' : '小时'}前)`,
                data: compareData.map(item => item.value),
                borderColor: chartTheme.series.compare,
                borderWidth: 2,
                tension: 0.24,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHitRadius: 12,
                borderDash: [6, 4]
            });
        }
    }

    initDefaultValues() {
        this.rangeSelect.value = '24h';
        this.timeIntervalSelect.value = '15m';
        this.compareUnitSelect.value = 'days';

        const now = moment();
        const twentyFourHoursAgo = moment().subtract(24, 'hours');
        this.startDateInput.value = twentyFourHoursAgo.local().format('YYYY-MM-DDTHH:mm');
        this.endDateInput.value = now.local().format('YYYY-MM-DDTHH:mm');
    }

    setFetchButtonLoading(isLoading) {
        this.fetchDataButton.disabled = isLoading;
        this.fetchDataButton.classList.toggle('is-loading', isLoading);
        this.fetchDataButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        this.fetchDataButton.textContent = isLoading ? '查询中...' : '查询';
        this.setExportButtonDisabled(isLoading || !this.exportPayload);
    }

    setExportButtonDisabled(disabled) {
        if (!this.exportCsvButton) return;
        this.exportCsvButton.disabled = disabled;
    }

    setExportPayload(chartData, meta) {
        const labels = Array.isArray(chartData?.labels) ? chartData.labels : [];
        const datasets = Array.isArray(chartData?.datasets) ? chartData.datasets : [];

        if (labels.length === 0 || datasets.length === 0) {
            this.clearExportPayload();
            return;
        }

        this.exportPayload = {
            labels: [...labels],
            datasets: datasets.map(dataset => ({
                label: dataset.label,
                data: Array.isArray(dataset.data) ? [...dataset.data] : []
            })),
            meta: {
                startLocal: meta?.startLocal || '',
                endLocal: meta?.endLocal || '',
                timeInterval: meta?.timeInterval || '',
                indicator: meta?.indicator || ''
            }
        };
    }

    clearExportPayload() {
        this.exportPayload = null;
        this.setExportButtonDisabled(true);
    }

    handleExportCsv() {
        try {
            const result = exportChartDataToCsv(this.exportPayload);
            this.showToast(`导出成功：${result.fileName}（${result.rowCount}行）`, 'success');
        } catch (err) {
            this.showToast(`导出失败：${err.message}`, 'error');
        }
    }

    showToast(message, type = 'error') {
        if (!this.toastEl) return;

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        this.toastEl.textContent = message;
        this.toastEl.classList.remove('hidden', 'toast-success', 'toast-error', 'show');
        this.toastEl.classList.add(type === 'success' ? 'toast-success' : 'toast-error');

        requestAnimationFrame(() => {
            this.toastEl.classList.add('show');
        });

        this.toastTimer = setTimeout(() => {
            this.toastEl.classList.remove('show');
            setTimeout(() => {
                this.toastEl.classList.add('hidden');
            }, 250);
        }, 2600);
    }

    fetchInitialData() {
        this.fetchDataButton.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});