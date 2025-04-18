export const dateUtils = {
    toUTC(dateString) {
        if (!dateString) return null;
        const m = moment(dateString);
        return m.isValid() ? m.utc().format('YYYY-MM-DD HH:mm') : null;
    },

    fromUTC(utcTimestamp) {
        return moment.utc(utcTimestamp).local().format('YYYY-MM-DD HH:mm');
    },

    setDateRange(startDateInput, endDateInput, range) {
        const now = moment();
        const rangeOptions = {
            '2h': {value: 2, unit: 'hours'},
            '8h': {value: 8, unit: 'hours'},
            '24h': {value: 24, unit: 'hours'},
            '3d': {value: 3, unit: 'days'},
            '5d': {value: 5, unit: 'days'},
            '7d': {value: 7, unit: 'days'},
            '14d': {value: 14, unit: 'days'},
            '30d': {value: 30, unit: 'days'}
        };

        const option = rangeOptions[range];
        if (!option) {
            console.warn("未知的快速选择范围:", range);
            return;
        }

        const start = moment().subtract(option.value, option.unit);
        startDateInput.value = start.local().format('YYYY-MM-DDTHH:mm');
        endDateInput.value = now.local().format('YYYY-MM-DDTHH:mm');
    }
};