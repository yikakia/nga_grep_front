export const api = {
    async fetchData(startDateUTC, endDateUTC, timeInterval, indicator) {
        if (!startDateUTC || !endDateUTC || !timeInterval) {
            throw new Error("无效的查询参数");
        }

        let url = `https://nga_grep.yikakia.com/api/timeseries?startDate=${startDateUTC}&endDate=${endDateUTC}&timeInterval=${timeInterval}`;
        // let url = `http://localhost:11648/api/timeseries?startDate=${startDateUTC}&endDate=${endDateUTC}&timeInterval=${timeInterval}`;
        if (indicator) {
            url += `&indicator=${indicator}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
};