import { ThemeManager } from './theme.js';
import { ChartManager } from './chart.js';
import { dateUtils } from './dateUtils.js';
import { api } from './api.js';
import { IndicatorHandler } from './indicators.js';

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
        this.timeIntervalSelect = document.getElementById('timeInterval');
        this.rangeSelect = document.getElementById('rangeSelect');
        this.compareOffsetInput = document.getElementById('compareOffset');
        this.compareUnitSelect = document.getElementById('compareUnit');
        this.indicatorSelect = document.getElementById('indicatorSelect');
        this.toastEl = document.getElementById('toast');
        this.toastTimer = null;
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

            this.updateChartData(currentResp, compareResp, compareOffset, compareUnit, selectedIndicator);
        } catch (err) {
            console.error("数据获取或处理失败:", err);
            this.showToast(`获取数据失败: ${err.message}。请检查网络或控制台日志。`, 'error');
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

    updateChartData(currentResp, compareResp, compareOffset, compareUnit, selectedIndicator) {
        if (!currentResp ||!currentResp['data'] || !Array.isArray(currentResp['data'])) {
            throw new Error("主数据格式无效");
        }
        const currentData = currentResp['data'] ;

        const datasets = [];
        const labels = currentData.map(item => dateUtils.fromUTC(item.timestamp));

        // 添加主数据
        datasets.push({
            label: '当前发帖量',
            data: currentData.map(item => item.value),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            pointRadius: 1,
            pointHoverRadius: 5
        });

        // 添加技术指标
        if (selectedIndicator && currentData[0] && selectedIndicator in currentData[0]) {
            IndicatorHandler.process(selectedIndicator, datasets, currentData);
        }

        // 添加对比数据
        if (compareResp &&compareResp['data'] && Array.isArray(compareResp['data']) && compareResp['data'].length > 0) {
            this.addCompareDataset(datasets, compareResp['data'], currentData, compareOffset, compareUnit);
        }

        this.chartManager.updateChart(labels, datasets);
    }

    addCompareDataset(datasets, compareData, currentData, compareOffset, compareUnit) {
        if (compareData.length === currentData.length) {
            datasets.push({
                label: `对比发帖量 (${compareOffset}${compareUnit === 'days' ? '天' : '小时'}前)`,
                data: compareData.map(item => item.value),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
                pointRadius: 1,
                pointHoverRadius: 5,
                borderDash: [5, 5]
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