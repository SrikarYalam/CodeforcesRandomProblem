(function() {
    'use strict';

    // Codeforces problem tags
    const PROBLEM_TAGS = [
        'implementation', 'math', 'greedy', 'dp', 'data structures',
        'brute force', 'constructive algorithms', 'graphs', 'sortings',
        'binary search', 'dfs and similar', 'trees', 'strings', 'number theory',
        'combinatorics', 'geometry', 'bitmasks', 'two pointers', 'dsu',
        'shortest paths', 'probabilities', 'divide and conquer', 'hashing',
        'games', 'flows', 'interactive', 'matrices', 'fft', 'ternary search',
        'expression parsing', 'meet-in-the-middle', 'string suffix structures',
        '2-sat', 'chinese remainder theorem', 'schedules'
    ];

    // Rating ranges
    const RATING_RANGES = [
        { label: 'Any', min: 0, max: 4000 },
        { label: '800', min: 800, max: 800 },
        { label: '900', min: 900, max: 900 },
        { label: '1000', min: 1000, max: 1000 },
        { label: '1100', min: 1100, max: 1100 },
        { label: '1200', min: 1200, max: 1200 },
        { label: '1300', min: 1300, max: 1300 },
        { label: '1400', min: 1400, max: 1400 },
        { label: '1500', min: 1500, max: 1500 },
        { label: '1600', min: 1600, max: 1600 },
        { label: '1700', min: 1700, max: 1700 },
        { label: '1800', min: 1800, max: 1800 },
        { label: '1900', min: 1900, max: 1900 },
        { label: '2000', min: 2000, max: 2000 },
        { label: '2100', min: 2100, max: 2100 },
        { label: '2200', min: 2200, max: 2200 },
        { label: '2300', min: 2300, max: 2300 },
        { label: '2400', min: 2400, max: 2400 },
        { label: '2500', min: 2500, max: 2500 },
        { label: '2600+', min: 2600, max: 4000 },
        { label: 'Based on my rating', min: -1, max: -1 }
    ];

    let cachedProblems = null;
    let userRating = null;
    let userHandle = null;

    // Get username from the page
    function getUsername() {
        const headerLink = document.querySelector('a[href^="/profile/"]');
        if (headerLink) {
            const href = headerLink.getAttribute('href');
            return href.replace('/profile/', '');
        }
        return null;
    }

    // Fetch user rating
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
        return 1200; // Default rating
    }

    // Fetch all problems
    async function fetchProblems() {
        if (cachedProblems) {
            return cachedProblems;
        }

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

    // Filter problems based on criteria
    function filterProblems(problems, selectedTags, minRating, maxRating) {
        return problems.filter(problem => {
            // Check rating
            if (problem.rating) {
                if (problem.rating < minRating || problem.rating > maxRating) {
                    return false;
                }
            } else if (minRating > 0) {
                // Skip problems without rating if a specific rating is requested
                return false;
            }

            // Check tags
            if (selectedTags.length > 0) {
                const problemTags = problem.tags || [];
                const hasTag = selectedTags.some(tag => problemTags.includes(tag));
                if (!hasTag) {
                    return false;
                }
            }

            return true;
        });
    }

    // Get random problem
    async function getRandomProblem() {
        const problems = await fetchProblems();
        
        // Get selected tags
        const tagSelect = document.getElementById('cf-random-tags');
        const selectedTags = Array.from(tagSelect.selectedOptions).map(opt => opt.value).filter(v => v !== '');

        // Get rating range
        const ratingSelect = document.getElementById('cf-random-rating');
        const selectedRatingIndex = parseInt(ratingSelect.value);
        let minRating = RATING_RANGES[selectedRatingIndex].min;
        let maxRating = RATING_RANGES[selectedRatingIndex].max;

        // Handle "Based on my rating" option
        if (minRating === -1) {
            if (userRating) {
                // Get problems around user's rating (±200)
                minRating = Math.max(800, userRating - 200);
                maxRating = userRating + 200;
            } else {
                minRating = 800;
                maxRating = 1600;
            }
        }

        const filteredProblems = filterProblems(problems, selectedTags, minRating, maxRating);

        if (filteredProblems.length === 0) {
            showResult('No problems found matching your criteria. Try adjusting filters.', null);
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredProblems.length);
        const problem = filteredProblems[randomIndex];
        
        const problemUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
        const problemName = `${problem.contestId}${problem.index} - ${problem.name}`;
        const problemRating = problem.rating ? `(${problem.rating})` : '(Unrated)';

        showResult(`${problemName} ${problemRating}`, problemUrl);
    }

    // Show result
    function showResult(text, url) {
        const resultDiv = document.getElementById('cf-random-result');
        if (url) {
            resultDiv.innerHTML = `<a href="${url}" target="_blank" class="cf-random-problem-link">${text}</a>`;
        } else {
            resultDiv.innerHTML = `<span class="cf-random-no-result">${text}</span>`;
        }
    }

    // Create the widget HTML
    function createWidget() {
        const widget = document.createElement('div');
        widget.id = 'cf-random-problem-widget';
        widget.className = 'roundbox sidebox';

        // Create header
        const header = document.createElement('div');
        header.className = 'roundbox-lt';
        header.innerHTML = '&nbsp;';
        widget.appendChild(header);

        // Create title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'caption titled';
        titleDiv.innerHTML = '→ Random Problem';
        widget.appendChild(titleDiv);

        // Create content container
        const content = document.createElement('div');
        content.className = 'cf-random-content';

        // Create filters toggle
        const filtersToggle = document.createElement('div');
        filtersToggle.className = 'cf-random-filters-toggle';
        filtersToggle.innerHTML = `
            <span class="cf-toggle-text">▶ Show Filters</span>
        `;
        filtersToggle.onclick = function() {
            const filtersDiv = document.getElementById('cf-random-filters');
            const toggleText = this.querySelector('.cf-toggle-text');
            if (filtersDiv.style.display === 'none') {
                filtersDiv.style.display = 'block';
                toggleText.textContent = '▼ Hide Filters';
            } else {
                filtersDiv.style.display = 'none';
                toggleText.textContent = '▶ Show Filters';
            }
        };
        content.appendChild(filtersToggle);

        // Create filters container
        const filtersDiv = document.createElement('div');
        filtersDiv.id = 'cf-random-filters';
        filtersDiv.style.display = 'none';

        // Rating filter
        const ratingContainer = document.createElement('div');
        ratingContainer.className = 'cf-random-filter-group';
        ratingContainer.innerHTML = `
            <label for="cf-random-rating">Difficulty:</label>
            <select id="cf-random-rating" class="cf-random-select">
                ${RATING_RANGES.map((range, index) => 
                    `<option value="${index}">${range.label}</option>`
                ).join('')}
            </select>
        `;
        filtersDiv.appendChild(ratingContainer);

        // Tags filter
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'cf-random-filter-group';
        tagsContainer.innerHTML = `
            <label for="cf-random-tags">Tags:</label>
            <select id="cf-random-tags" class="cf-random-select cf-random-tags-select" multiple>
                <option value="">Any tag</option>
                ${PROBLEM_TAGS.map(tag => 
                    `<option value="${tag}">${tag}</option>`
                ).join('')}
            </select>
            <div class="cf-random-tags-hint">Hold Ctrl/Cmd to select multiple</div>
        `;
        filtersDiv.appendChild(tagsContainer);

        content.appendChild(filtersDiv);

        // Create button
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'cf-random-button-container';
        
        const button = document.createElement('button');
        button.id = 'cf-random-btn';
        button.className = 'cf-random-button';
        button.innerHTML = '🎲 Random Problem';
        button.onclick = async function() {
            this.disabled = true;
            this.innerHTML = '⏳ Loading...';
            await getRandomProblem();
            this.disabled = false;
            this.innerHTML = '🎲 Random Problem';
        };
        buttonDiv.appendChild(button);
        content.appendChild(buttonDiv);

        // Create result area
        const resultDiv = document.createElement('div');
        resultDiv.id = 'cf-random-result';
        resultDiv.className = 'cf-random-result';
        content.appendChild(resultDiv);

        // User rating display
        const userInfoDiv = document.createElement('div');
        userInfoDiv.id = 'cf-random-user-info';
        userInfoDiv.className = 'cf-random-user-info';
        content.appendChild(userInfoDiv);

        widget.appendChild(content);

        return widget;
    }

    // Initialize the extension
    async function init() {
        // Find the sidebar
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            console.log('Sidebar not found, retrying...');
            setTimeout(init, 1000);
            return;
        }

        // Check if widget already exists
        if (document.getElementById('cf-random-problem-widget')) {
            return;
        }

        // Find the calendar widget to insert after
        const roundboxes = sidebar.querySelectorAll('.roundbox.sidebox');
        let calendarWidget = null;
        
        for (const box of roundboxes) {
            const caption = box.querySelector('.caption');
            if (caption && caption.textContent.includes('2026') || caption && caption.textContent.includes('2025') || caption && caption.textContent.includes('2024')) {
                calendarWidget = box;
                break;
            }
        }

        // Create and insert widget
        const widget = createWidget();
        
        if (calendarWidget && calendarWidget.nextSibling) {
            sidebar.insertBefore(widget, calendarWidget.nextSibling);
        } else if (calendarWidget) {
            sidebar.appendChild(widget);
        } else {
            // Insert at the beginning if calendar not found
            const firstChild = sidebar.firstChild;
            if (firstChild) {
                sidebar.insertBefore(widget, firstChild);
            } else {
                sidebar.appendChild(widget);
            }
        }

        // Get user info
        userHandle = getUsername();
        if (userHandle) {
            userRating = await fetchUserRating(userHandle);
            const userInfoDiv = document.getElementById('cf-random-user-info');
            if (userInfoDiv && userRating) {
                userInfoDiv.innerHTML = `Your rating: <span class="cf-rating-${getRatingColor(userRating)}">${userRating}</span>`;
            }
            
            // Set default to "Based on my rating"
            const ratingSelect = document.getElementById('cf-random-rating');
            if (ratingSelect) {
                ratingSelect.value = RATING_RANGES.length - 1; // Last option
            }
        }

        // Pre-fetch problems
        fetchProblems();
    }

    // Get rating color class
    function getRatingColor(rating) {
        if (rating < 1200) return 'gray';
        if (rating < 1400) return 'green';
        if (rating < 1600) return 'cyan';
        if (rating < 1900) return 'blue';
        if (rating < 2100) return 'violet';
        if (rating < 2400) return 'orange';
        return 'red';
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also try after a delay for dynamic content
    setTimeout(init, 2000);
})();
