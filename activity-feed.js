/**
 * Live Activity Feed Widget
 * Auto-scrolling recent orders display
 */
(function() {
    'use strict';

    // Don't load on consultation page
    if (window.location.pathname.includes('book-consultation')) return;

    // Create styles
    const styles = document.createElement('style');
    styles.textContent = `
    .live-activity-feed {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 280px;
        height: 90px;
        background: transparent;
        font-family: 'Nunito', sans-serif;
        z-index: 9997;
        overflow: hidden;
        pointer-events: none;
    }
    .activity-feed-body {
        height: 100%;
        overflow: hidden;
        position: relative;
    }
    .activity-slider {
        display: flex;
        flex-direction: column;
        animation: activity-scroll 12s ease-in-out infinite;
    }
    @keyframes activity-scroll {
        0%, 20% { transform: translateY(0); }
        33%, 53% { transform: translateY(-33.33%); }
        66%, 86% { transform: translateY(-66.66%); }
        100% { transform: translateY(0); }
    }
    .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        min-height: 90px;
        box-sizing: border-box;
    }
    .activity-icon {
        width: 56px;
        height: 56px;
        border-radius: 10px;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .activity-icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .activity-content {
        flex: 1;
        min-width: 0;
    }
    .activity-text {
        font-size: 0.9rem;
        color: #5D4E37;
        line-height: 1.3;
        margin-bottom: 4px;
    }
    .activity-company {
        color: #3D2E1F;
        font-weight: 700;
    }
    .activity-product {
        color: #5D4E37;
        font-weight: 600;
    }
    .activity-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: #8B7355;
    }
    .activity-qty {
        background: rgba(93, 78, 55, 0.1);
        padding: 2px 8px;
        border-radius: 4px;
        color: #5D4E37;
        font-weight: 600;
    }
    .activity-time {
        color: #A89070;
    }
    @media (max-width: 768px) {
        .live-activity-feed {
            width: 240px;
            left: 10px;
            bottom: 80px;
            height: 80px;
        }
        .activity-item {
            min-height: 80px;
        }
        .activity-icon {
            width: 48px;
            height: 48px;
        }
        .activity-text {
            font-size: 0.85rem;
        }
    }
    @media (max-width: 480px) {
        .live-activity-feed {
            width: 200px;
            left: 8px;
            bottom: 75px;
            height: 70px;
        }
        .activity-item {
            min-height: 70px;
            gap: 8px;
        }
        .activity-icon {
            width: 40px;
            height: 40px;
        }
        .activity-text {
            font-size: 0.78rem;
        }
        .activity-meta {
            font-size: 0.68rem;
        }
    }
    `;
    document.head.appendChild(styles);

    // Create feed HTML
    const feedHTML = `
    <div class="live-activity-feed" id="liveActivityFeed">
        <div class="activity-feed-body" id="activityFeedBody"></div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', feedHTML);

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

    // Determine base path for JSON file
    const basePath = window.location.pathname.includes('/') ? '' : '';

    fetch(basePath + 'recent-orders.json')
        .then(r => r.json())
        .then(data => {
            const orders = data.orders.slice(0, 3);
            const items = orders.map(order => {
                const timeStr = formatTime(order.daysAgo);
                const imgSrc = order.image || '';
                return `<div class="activity-item">
                    <div class="activity-icon">
                        ${imgSrc ? `<img src="${basePath}${imgSrc}" alt="${order.company}" loading="lazy">` : ''}
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
