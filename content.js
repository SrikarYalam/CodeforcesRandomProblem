(function() {
    'use strict';

    const PROBLEM_TAGS = [
        'implementation', 'math', 'greedy', 'dp', 'data structures',
        'brute force', 'constructive algorithms', 'graphs', 'sortings',
        'binary search', 'dfs and similar', 'trees', 'strings', 'number theory',
        'combinatorics', 'geometry', 'bitmasks', 'two pointers', 'dsu',
        'shortest paths', 'probabilities', 'divide and conquer', 'hashing',
        'games', 'flows', 'interactive', 'matrices', 'fft', 'ternary search'
    ];

    const RATINGS = [
        'Auto', '800', '900', '1000', '1100', '1200', '1300', '1400', '1500',
        '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300', '2400',
        '2500', '2600', '2700', '2800', '2900', '3000', '3100', '3200', '3300', '3400', '3500'
    ];

    let cachedProblems = null;
    let userRating = null;
    let userHandle = null;

    function getUsername() {
        const headerLink = document.querySelector('a[href^="/profile/"]');
        if (headerLink) {
            return headerLink.getAttribute('href').replace('/profile/', '');
        }
        return null;
    }

    async function fetchUserRating(handle) {
        try {
            const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
            const data = await response.json();
            if (data.status === 'OK' && data.result.length > 0) {
                return data.result[0].rating || 1200;
            }
        } catch (error) {
            console.error('Error fetching user rating:', error);
        }
        return 1200;
    }

    async function fetchProblems() {
        if (cachedProblems) return cachedProblems;
        try {
            const response = await fetch('https://codeforces.com/api/problemset.problems');
            const data = await response.json();
            if (data.status === 'OK') {
                cachedProblems = data.result.problems;
                return cachedProblems;
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
        return [];
    }

    function filterProblems(problems, selectedTags, minRating, maxRating) {
        return problems.filter(problem => {
            // Check rating
            if (!problem.rating) return false;
            if (problem.rating < minRating || problem.rating > maxRating) {
                return false;
            }
            
            // Check tags
            if (selectedTags.length > 0 && selectedTags[0] !== '') {
                const problemTags = problem.tags || [];
                if (!selectedTags.some(tag => problemTags.includes(tag))) {
                    return false;
                }
            }
            return true;
        });
    }

    async function getRandomProblem() {
        const problems = await fetchProblems();
        
        const tagSelect = document.getElementById('cf-rp-tags');
        const selectedTags = tagSelect ? Array.from(tagSelect.selectedOptions).map(opt => opt.value) : [];
        
        const ratingSelect = document.getElementById('cf-rp-rating');
        const selectedRating = ratingSelect ? ratingSelect.value : 'Auto';

        let minRating, maxRating;
        
        if (selectedRating === 'Auto') {
            // Default: 100-200 above user's rating
            const baseRating = userRating || 1200;
            minRating = baseRating + 100;
            maxRating = baseRating + 250;
        } else {
            const rating = parseInt(selectedRating);
            minRating = rating;
            maxRating = rating;
        }

        const filteredProblems = filterProblems(problems, selectedTags, minRating, maxRating);

        const resultDiv = document.getElementById('cf-rp-result');
        
        if (filteredProblems.length === 0) {
            resultDiv.innerHTML = '<span class="cf-rp-no-result">No problems found</span>';
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredProblems.length);
        const problem = filteredProblems[randomIndex];
        
        const problemUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
        const problemName = `${problem.contestId}${problem.index} - ${problem.name}`;
        const ratingText = problem.rating ? `(${problem.rating})` : '';
        const ratingClass = problem.rating ? getRatingClass(problem.rating) : '';

        resultDiv.innerHTML = `
            <a href="${problemUrl}" target="_blank" class="cf-rp-problem-link">
                ${problemName} <span class="${ratingClass}">${ratingText}</span>
            </a>
        `;
    }

    function getRatingClass(rating) {
        if (rating < 1200) return 'cf-rp-gray';
        if (rating < 1400) return 'cf-rp-green';
        if (rating < 1600) return 'cf-rp-cyan';
        if (rating < 1900) return 'cf-rp-blue';
        if (rating < 2100) return 'cf-rp-violet';
        if (rating < 2400) return 'cf-rp-orange';
        return 'cf-rp-red';
    }

    function createWidget() {
        const widget = document.createElement('div');
        widget.id = 'cf-rp-widget';
        widget.innerHTML = `
            <div class="cf-rp-header">
                <span class="cf-rp-title">→ Random Problem</span>
                <span class="cf-rp-settings-icon" id="cf-rp-settings-btn" title="Settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </span>
            </div>
            <div class="cf-rp-body">
                <div class="cf-rp-filters" id="cf-rp-filters">
                    <div class="cf-rp-filter-row">
                        <label>Rating:</label>
                        <select id="cf-rp-rating">
                            ${RATINGS.map(r => `<option value="${r}">${r === 'Auto' ? 'Auto (+100 to +200)' : r}</option>`).join('')}
                        </select>
                    </div>
                    <div class="cf-rp-filter-row">
                        <label>Tags:</label>
                        <select id="cf-rp-tags" multiple>
                            <option value="">Any</option>
                            ${PROBLEM_TAGS.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button class="cf-rp-button" id="cf-rp-btn">Random Problem</button>
                <div class="cf-rp-result" id="cf-rp-result"></div>
            </div>
        `;
        return widget;
    }

    function setupEventListeners() {
        const settingsBtn = document.getElementById('cf-rp-settings-btn');
        const filters = document.getElementById('cf-rp-filters');
        const btn = document.getElementById('cf-rp-btn');

        settingsBtn.addEventListener('click', () => {
            filters.classList.toggle('cf-rp-filters-visible');
            settingsBtn.classList.toggle('cf-rp-settings-active');
        });

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = 'Loading...';
            await getRandomProblem();
            btn.disabled = false;
            btn.textContent = 'Random Problem';
        });
    }

    async function init() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            setTimeout(init, 1000);
            return;
        }

        if (document.getElementById('cf-rp-widget')) return;

        // Get user info first
        userHandle = getUsername();
        if (userHandle) {
            userRating = await fetchUserRating(userHandle);
        }

        // Find calendar widget
        const roundboxes = sidebar.querySelectorAll('.roundbox.sidebox');
        let calendarWidget = null;
        
        for (const box of roundboxes) {
            const caption = box.querySelector('.caption.titled');
            if (caption) {
                const text = caption.textContent || '';
                if (text.match(/\d{4}/)) {
                    calendarWidget = box;
                    break;
                }
            }
        }

        const widget = createWidget();
        
        if (calendarWidget && calendarWidget.nextSibling) {
            sidebar.insertBefore(widget, calendarWidget.nextSibling);
        } else if (calendarWidget) {
            calendarWidget.after(widget);
        } else {
            sidebar.prepend(widget);
        }

        setupEventListeners();
        fetchProblems();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setTimeout(init, 1500);
})();
