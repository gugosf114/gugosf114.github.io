// Live Activity Feed - Auto-scrolling
(function() {
    const body = document.getElementById('activityFeedBody');
    if (!body) return;

    // Format relative time
    function formatTime(daysAgo) {
        if (daysAgo === 0) return 'Today';
        if (daysAgo === 1) return 'Yesterday';
        if (daysAgo < 7) return `${daysAgo} days ago`;
        if (daysAgo === 7) return '1 week ago';
        return `${Math.floor(daysAgo / 7)} weeks ago`;
    }

    fetch('recent-orders.json')
        .then(r => r.json())
        .then(data => {
            const orders = data.orders.slice(0, 3);
            const items = orders.map(order => {
                const timeStr = formatTime(order.daysAgo);
                const imgSrc = order.image || '';
                return `<div class="activity-item">
                    <div class="activity-icon">
                        ${imgSrc ? `<img src="${imgSrc}" alt="${order.company}" loading="lazy">` : ''}
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <span class="activity-company">${order.company}</span>
                            <span class="activity-product"> ordered ${order.product}</span>
                        </div>
                        <div class="activity-meta">
                            <span class="activity-qty">${order.quantity} pcs</span>
                            <span class="activity-time">${timeStr}</span>
                        </div>
                    </div>
                </div>`;
            }).join('');
            body.innerHTML = `<div class="activity-slider">${items}</div>`;
        })
        .catch(() => {});
})();
