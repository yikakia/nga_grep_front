export class ChartManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    updateChart(labels, datasets) {
        if (this.chart) this.chart.destroy();

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '时间 (本地时间)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '数值'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}