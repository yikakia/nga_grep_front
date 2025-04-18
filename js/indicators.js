export class IndicatorHandler {
    static handlers = {
        boll: {
            process: (datasets, currentData) => {
                const bollColors = {
                    upper: 'rgba(234,222,119,0.75)',
                    lower: 'rgba(217,141,234,0.75)',
                    middle: 'rgba(198,214,212,0.59)'
                };

                ['upper', 'lower', 'middle'].forEach(line => {
                    datasets.push({
                        label: line.toUpperCase(),
                        data: currentData.map(item => item.boll[line]),
                        borderColor: bollColors[line],
                        borderWidth: 1,
                        tension: 0.1,
                        pointRadius: 1,
                        pointHoverRadius: 5
                    });
                });
            }
        },
        ma5: {
            process: (datasets, currentData) => {
                datasets.push({
                    label: 'MA5',
                    data: currentData.map(item => item.ma5),
                    borderColor: 'rgb(255, 159, 64)',
                    tension: 0.1,
                    pointRadius: 1,
                    pointHoverRadius: 5
                });
            }
        },
        ma10: {
            process: (datasets, currentData) => {
                datasets.push({
                    label: 'MA10',
                    data: currentData.map(item => item.ma10),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    pointRadius: 1,
                    pointHoverRadius: 5
                });
            }
        }
    };

    static process(indicator, datasets, currentData) {
        const handler = this.handlers[indicator];
        if (handler) {
            handler.process(datasets, currentData);
        }
    }

    static registerHandler(name, handler) {
        this.handlers[name] = handler;
    }
}