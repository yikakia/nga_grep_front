export class IndicatorHandler {
    static handlers = {
        boll: {
            process: (datasets, currentData, chartTheme) => {
                datasets.push({
                    label: 'BOLL Upper',
                    data: currentData.map(item => item.boll.upper),
                    borderColor: chartTheme.series.bollUpper,
                    backgroundColor: chartTheme.series.bollFill,
                    borderWidth: 1.7,
                    tension: 0.25,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointHitRadius: 10,
                    fill: '+1'
                });

                datasets.push({
                    label: 'BOLL Lower',
                    data: currentData.map(item => item.boll.lower),
                    borderColor: chartTheme.series.bollLower,
                    borderWidth: 1.7,
                    tension: 0.25,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointHitRadius: 10,
                    fill: false
                });

                datasets.push({
                    label: 'BOLL Mid',
                    data: currentData.map(item => item.boll.middle),
                    borderColor: chartTheme.series.bollMiddle,
                    borderWidth: 1.5,
                    tension: 0.25,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointHitRadius: 10,
                    borderDash: [4, 4]
                });
            }
        },
        ma5: {
            process: (datasets, currentData, chartTheme) => {
                datasets.push({
                    label: 'MA5',
                    data: currentData.map(item => item.ma5),
                    borderColor: chartTheme.series.ma5,
                    borderWidth: 2,
                    tension: 0.24,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHitRadius: 10
                });
            }
        },
        ma10: {
            process: (datasets, currentData, chartTheme) => {
                datasets.push({
                    label: 'MA10',
                    data: currentData.map(item => item.ma10),
                    borderColor: chartTheme.series.ma10,
                    borderWidth: 2,
                    tension: 0.24,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHitRadius: 10,
                    borderDash: [5, 3]
                });
            }
        }
    };

    static process(indicator, datasets, currentData, chartTheme) {
        const handler = this.handlers[indicator];
        if (handler) {
            handler.process(datasets, currentData, chartTheme);
        }
    }

    static registerHandler(name, handler) {
        this.handlers[name] = handler;
    }
}