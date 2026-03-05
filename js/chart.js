export class ChartManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    updateChart(labels, datasets, chartTheme = {}) {
        if (this.chart) this.chart.destroy();

        const theme = {
            grid: 'rgba(148, 163, 184, 0.18)',
            axis: '#94a3b8',
            legend: '#cbd5e1',
            tooltipBg: 'rgba(15, 23, 42, 0.96)',
            tooltipText: '#e2e8f0',
            tooltipBorder: '#334155',
            ...chartTheme
        };

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels,
                datasets
            },
            options: {
                normalized: true,
                animation: {
                    duration: 260
                },
                elements: {
                    line: {
                        capBezierPoints: true
                    },
                    point: {
                        hoverBorderWidth: 2,
                        hoverBorderColor: theme.tooltipBg
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: theme.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: theme.axis,
                            maxRotation: 0,
                            autoSkip: true
                        },
                        title: {
                            display: true,
                            text: '时间 (本地时间)',
                            color: theme.axis,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: theme.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: theme.axis,
                            padding: 8
                        },
                        title: {
                            display: true,
                            text: '数值',
                            color: theme.axis,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'start',
                        labels: {
                            color: theme.legend,
                            usePointStyle: true,
                            pointStyle: 'line',
                            boxWidth: 14,
                            boxHeight: 6,
                            padding: 14
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: theme.tooltipBg,
                        titleColor: theme.tooltipText,
                        bodyColor: theme.tooltipText,
                        borderColor: theme.tooltipBorder,
                        borderWidth: 1,
                        padding: 10,
                        displayColors: true,
                        boxPadding: 4
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