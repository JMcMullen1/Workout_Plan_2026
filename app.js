// ============================================
// DATA MODEL & STATE
// ============================================

const STORAGE_KEY = 'training-macrocycle-2026';

const DEFAULT_DATA = {
    macrocycle: {
        id: '2026',
        name: 'Macrocycle 2026',
        mesocycles: []
    }
};

let appState = {
    data: null,
    currentMesocycleId: null,
    currentWeek: 1,
    activeGoalFilter: 'all',
    editingMesocycleId: null
};

// Goal definitions
const GOALS = {
    1: { name: 'Dunk', icon: '🏀', color: 'goal-1' },
    2: { name: 'Murph', icon: '💪', color: 'goal-2' },
    3: { name: 'Hyrox', icon: '🏃', color: 'goal-3' },
    4: { name: 'BJJ', icon: '🥋', color: 'goal-4' }
};

// Lower body hypertrophy template
const LOWER_BODY_TEMPLATE = [
    { name: 'Leg Press', sets: '3-4', reps: '8-15' },
    { name: 'Leg Curl', sets: '3-4', reps: '8-15' },
    { name: 'Leg Extension', sets: '3-4', reps: '8-15' },
    { name: 'Hip Abductor', sets: '3-4', reps: '8-15' },
    { name: 'Calf Raise', sets: '3-4', reps: '8-15' },
    { name: 'Hack Squat (optional)', sets: '3-4', reps: '8-15' }
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    registerServiceWorker();
    initEventListeners();
    renderMacrocycleView();
});

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            appState.data = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading data:', e);
            appState.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    } else {
        appState.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    // Auto-generate Mesocycle 1 if no mesocycles exist
    if (appState.data.macrocycle.mesocycles.length === 0) {
        initializeMesocycle1();
    }
}

function initializeMesocycle1() {
    // Set default dates: Start on Monday, January 5, 2026 (4 weeks)
    const fromDate = '2026-01-05';
    const toDate = '2026-02-01'; // 4 weeks later (Monday to Sunday)

    const mesocycle1 = {
        id: 'meso-1',
        name: 'Mesocycle 1',
        fromDate: fromDate,
        toDate: toDate,
        template: 'mesocycle-1',
        schedule: generateMesocycle1Schedule(fromDate, toDate),
        logs: {}
    };

    appState.data.macrocycle.mesocycles.push(mesocycle1);
    saveData();
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.data));
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Macrocycle view
    document.getElementById('add-mesocycle-btn').addEventListener('click', () => openMesocycleModal());
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file-input').click();
    });
    document.getElementById('import-file-input').addEventListener('change', importData);

    // Mesocycle detail view
    document.getElementById('back-btn').addEventListener('click', () => {
        showView('macrocycle-view');
        appState.currentMesocycleId = null;
    });
    document.getElementById('edit-mesocycle-btn').addEventListener('click', () => {
        const meso = getMesocycle(appState.currentMesocycleId);
        if (meso) openMesocycleModal(meso);
    });

    // Filter chips
    document.querySelectorAll('.filter-chips .chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            appState.activeGoalFilter = e.target.dataset.goal;
            renderScheduleGrid();
        });
    });

    // Mesocycle modal
    document.getElementById('close-mesocycle-modal').addEventListener('click', closeMesocycleModal);
    document.getElementById('cancel-mesocycle').addEventListener('click', closeMesocycleModal);
    document.getElementById('mesocycle-form').addEventListener('submit', saveMesocycle);
    document.getElementById('delete-mesocycle').addEventListener('click', deleteMesocycle);

    // Session modal
    document.getElementById('close-session-modal').addEventListener('click', closeSessionModal);

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ============================================
// VIEW MANAGEMENT
// ============================================

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// ============================================
// MACROCYCLE VIEW
// ============================================

function renderMacrocycleView() {
    const container = document.getElementById('mesocycle-list');
    const mesocycles = appState.data.macrocycle.mesocycles;

    if (mesocycles.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted" style="padding: 3rem 1rem;">
                <p style="font-size: 3rem; margin-bottom: 1rem;">🏋️</p>
                <p>No mesocycles yet. Start your 2026 training!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = mesocycles.map(meso => {
        const progress = calculateMesocycleProgress(meso);
        const duration = calculateDuration(meso.fromDate, meso.toDate);

        return `
            <div class="mesocycle-card" data-id="${meso.id}">
                <h3>${meso.name}</h3>
                <div class="mesocycle-meta">
                    <span>📅 ${formatDate(meso.fromDate)} → ${formatDate(meso.toDate)}</span>
                    <span>⏱️ ${duration}</span>
                </div>
                <div class="mesocycle-progress">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span style="font-size: 0.875rem;">Completion</span>
                        <span style="font-size: 0.875rem; font-weight: 600;">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click listeners
    container.querySelectorAll('.mesocycle-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            openMesocycle(id);
        });
    });
}

function openMesocycle(id) {
    appState.currentMesocycleId = id;
    appState.currentWeek = 1;
    appState.activeGoalFilter = 'all';

    const meso = getMesocycle(id);
    document.getElementById('mesocycle-title').textContent = meso.name;

    // Reset filter
    document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.filter-chips .chip[data-goal="all"]').classList.add('active');

    renderWeekTabs(meso);
    renderScheduleGrid();
    showView('mesocycle-detail-view');
}

function calculateMesocycleProgress(meso) {
    if (!meso.schedule || meso.schedule.length === 0) return 0;

    const totalSessions = meso.schedule.length;
    const completedSessions = meso.schedule.filter(s => s.completed).length;

    return Math.round((completedSessions / totalSessions) * 100);
}

function calculateDuration(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.floor(days / 7);

    if (weeks > 0) {
        return `${weeks} week${weeks > 1 ? 's' : ''} (${days} days)`;
    }
    return `${days} day${days > 1 ? 's' : ''}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================
// MESOCYCLE DETAIL VIEW
// ============================================

function renderWeekTabs(meso) {
    const weeks = Math.ceil(meso.schedule.filter(s => s.type !== 'gtg').length / 7) || 4;
    const container = document.getElementById('week-tabs');

    container.innerHTML = Array.from({ length: weeks }, (_, i) => {
        const weekNum = i + 1;
        const isActive = weekNum === appState.currentWeek;
        return `<button class="week-tab ${isActive ? 'active' : ''}" data-week="${weekNum}">Week ${weekNum}</button>`;
    }).join('');

    container.querySelectorAll('.week-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            container.querySelectorAll('.week-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            appState.currentWeek = parseInt(e.target.dataset.week);
            renderScheduleGrid();
        });
    });
}

function renderScheduleGrid() {
    const meso = getMesocycle(appState.currentMesocycleId);
    if (!meso) return;

    const container = document.getElementById('schedule-grid');

    // Filter by week
    const weekSessions = getWeekSessions(meso, appState.currentWeek);

    // Filter by goal
    const filteredSessions = appState.activeGoalFilter === 'all'
        ? weekSessions
        : weekSessions.filter(s => {
            if (s.goal === null || s.goal === undefined) return appState.activeGoalFilter === 'all';
            return s.goal.toString() === appState.activeGoalFilter;
        });

    if (filteredSessions.length === 0) {
        container.innerHTML = '<div class="text-center text-muted" style="padding: 2rem;">No sessions match this filter.</div>';
        return;
    }

    // Group by date
    const grouped = groupByDate(filteredSessions);

    container.innerHTML = Object.entries(grouped).map(([date, sessions]) => {
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const dateFormatted = formatDate(date);

        return `
            <div class="day-group">
                <div class="day-header">${dayName}, ${dateFormatted}</div>
                ${sessions.map(s => renderSessionCard(s)).join('')}
            </div>
        `;
    }).join('');

    // Add click listeners
    container.querySelectorAll('.session-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            openSessionModal(id);
        });
    });

    // Add GTG set checkbox listeners
    container.querySelectorAll('.set-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            const sessionId = checkbox.dataset.sessionId;
            const movementIndex = parseInt(checkbox.dataset.movementIndex);
            const setIndex = parseInt(checkbox.dataset.setIndex);
            toggleGTGSet(sessionId, movementIndex, setIndex);
        });
    });
}

function renderSessionCard(session) {
    const goalClass = session.goal ? `goal-${session.goal}` : '';
    const completedClass = session.completed ? 'completed' : '';
    const goalBadge = session.goal ? GOALS[session.goal].icon : '';

    let preview = '';

    if (session.type === 'gtg') {
        const completedSets = session.movements.reduce((sum, m) =>
            sum + m.completed.filter(c => c).length, 0);
        const totalSets = session.movements.reduce((sum, m) => sum + m.completed.length, 0);
        preview = `
            <div class="session-meta">${session.movements.map(m => `${m.name}: ${m.target} reps`).join(' • ')}</div>
            <div class="gtg-sets">
                ${session.movements.map((movement, mIdx) =>
                    movement.completed.map((checked, sIdx) => `
                        <div class="set-checkbox ${checked ? 'checked' : ''}"
                             data-session-id="${session.id}"
                             data-movement-index="${mIdx}"
                             data-set-index="${sIdx}">
                            ${checked ? '✓' : ''}
                        </div>
                    `).join('')
                ).join('')}
            </div>
            <div class="session-preview">${completedSets}/${totalSets} sets completed</div>
        `;
    } else if (session.type === 'hyrox') {
        preview = `<div class="session-meta">${session.variant} Hyrox${session.runTarget ? ` • 1km: ${session.runTarget}` : ''}</div>`;
    } else if (session.type === 'lower-hypertrophy') {
        preview = `<div class="session-meta">6 exercises • Machine-based</div>`;
    } else if (session.type === 'jump') {
        preview = `<div class="session-meta">Basketball jump training</div>`;
    } else if (session.type === 'grappling') {
        preview = `<div class="session-meta">BJJ solo drills</div>`;
    }

    return `
        <div class="session-card ${goalClass} ${completedClass}" data-id="${session.id}">
            <div class="session-header">
                <div class="session-title">${session.title}</div>
                ${goalBadge ? `<div class="session-badge">${goalBadge}</div>` : ''}
            </div>
            ${preview}
        </div>
    `;
}

function getWeekSessions(meso, weekNum) {
    const fromDate = new Date(meso.fromDate);
    const weekStart = new Date(fromDate);
    weekStart.setDate(fromDate.getDate() + (weekNum - 1) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return meso.schedule.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
    });
}

function groupByDate(sessions) {
    const grouped = {};
    sessions.forEach(session => {
        if (!grouped[session.date]) {
            grouped[session.date] = [];
        }
        grouped[session.date].push(session);
    });
    return grouped;
}

// ============================================
// SESSION MODAL
// ============================================

function openSessionModal(sessionId) {
    const meso = getMesocycle(appState.currentMesocycleId);
    const session = meso.schedule.find(s => s.id === sessionId);
    if (!session) return;

    document.getElementById('session-modal-title').textContent = session.title;
    const body = document.getElementById('session-modal-body');

    let content = '';

    // Completion checkbox
    content += `
        <div class="checkbox-field">
            <input type="checkbox" id="session-completed" ${session.completed ? 'checked' : ''}>
            <label for="session-completed">Mark as completed</label>
        </div>
    `;

    // Type-specific content
    if (session.type === 'gtg') {
        content += '<h3 style="margin: 1.5rem 0 1rem;">Movements</h3>';
        session.movements.forEach((movement, mIdx) => {
            const completedSets = movement.completed.filter(c => c).length;
            content += `
                <div class="gtg-movement">
                    <div class="gtg-movement-header">
                        <div class="gtg-movement-name">${movement.name}</div>
                        <div class="gtg-target">Target: ${movement.target} reps</div>
                    </div>
                    <div style="margin-top: 0.75rem;">
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                            Sets completed: ${completedSets}/${movement.completed.length}
                        </div>
                        <div class="gtg-sets">
                            ${movement.completed.map((checked, sIdx) => `
                                <div class="set-checkbox ${checked ? 'checked' : ''}"
                                     data-movement="${mIdx}"
                                     data-set="${sIdx}"
                                     onclick="toggleModalGTGSet(${mIdx}, ${sIdx})">
                                    ${checked ? '✓' : sIdx + 1}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
    } else if (session.type === 'lower-hypertrophy') {
        content += '<h3 style="margin: 1.5rem 0 1rem;">Exercises</h3>';
        content += '<div class="exercise-list">';
        session.exercises.forEach(ex => {
            content += `
                <div class="exercise-item">
                    <div class="exercise-name">${ex.name}</div>
                    <div class="exercise-details">${ex.sets} sets × ${ex.reps} reps</div>
                </div>
            `;
        });
        content += '</div>';
    } else if (session.type === 'hyrox') {
        content += `
            <div class="form-group">
                <label>Type</label>
                <div style="padding: 0.5rem 0; color: var(--text-primary);">${session.variant} Hyrox (Pro weights)</div>
            </div>
        `;
        if (session.runTarget) {
            content += `
                <div class="form-group">
                    <label>1km Run Target</label>
                    <div style="padding: 0.5rem 0; color: var(--goal-3); font-weight: 600; font-size: 1.25rem;">
                        ${session.runTarget}
                    </div>
                </div>
            `;
        }
    }

    // RPE
    if (session.type !== 'gtg') {
        content += `
            <div class="form-group mt-2">
                <label for="session-rpe">RPE (0-10)</label>
                <input type="number" id="session-rpe" min="0" max="10" step="0.5"
                       value="${session.rpe || ''}" placeholder="Rate of Perceived Exertion">
            </div>
        `;
    }

    // Notes
    content += `
        <div class="form-group">
            <label for="session-notes">Notes</label>
            <textarea id="session-notes" placeholder="Add notes about this session...">${session.notes || ''}</textarea>
        </div>
    `;

    // Save button
    content += `
        <button class="btn-primary btn-full" onclick="saveSessionDetails('${sessionId}')">Save</button>
    `;

    body.innerHTML = content;

    document.getElementById('session-modal').classList.add('active');
}

function closeSessionModal() {
    document.getElementById('session-modal').classList.remove('active');
}

// Global functions for inline event handlers
window.toggleModalGTGSet = function(movementIdx, setIdx) {
    const meso = getMesocycle(appState.currentMesocycleId);
    const modalTitle = document.getElementById('session-modal-title').textContent;
    const session = meso.schedule.find(s => s.title === modalTitle);

    if (session && session.type === 'gtg') {
        session.movements[movementIdx].completed[setIdx] = !session.movements[movementIdx].completed[setIdx];
        saveData();
        openSessionModal(session.id); // Re-render
        renderScheduleGrid(); // Update main view
    }
};

window.saveSessionDetails = function(sessionId) {
    const meso = getMesocycle(appState.currentMesocycleId);
    const session = meso.schedule.find(s => s.id === sessionId);
    if (!session) return;

    session.completed = document.getElementById('session-completed').checked;
    session.notes = document.getElementById('session-notes').value;

    const rpeInput = document.getElementById('session-rpe');
    if (rpeInput) {
        session.rpe = rpeInput.value ? parseFloat(rpeInput.value) : null;
    }

    saveData();
    closeSessionModal();
    renderScheduleGrid();
    renderMacrocycleView(); // Update progress
};

function toggleGTGSet(sessionId, movementIndex, setIndex) {
    const meso = getMesocycle(appState.currentMesocycleId);
    const session = meso.schedule.find(s => s.id === sessionId);

    if (session && session.type === 'gtg') {
        session.movements[movementIndex].completed[setIndex] =
            !session.movements[movementIndex].completed[setIndex];
        saveData();
        renderScheduleGrid();
    }
}

// ============================================
// MESOCYCLE MODAL
// ============================================

function openMesocycleModal(mesocycle = null) {
    const isEdit = mesocycle !== null;
    appState.editingMesocycleId = isEdit ? mesocycle.id : null;

    document.getElementById('mesocycle-modal-title').textContent =
        isEdit ? 'Edit Mesocycle' : 'New Mesocycle';

    document.getElementById('meso-name').value = mesocycle?.name || '';
    document.getElementById('meso-from').value = mesocycle?.fromDate || '';
    document.getElementById('meso-to').value = mesocycle?.toDate || '';
    document.getElementById('meso-template').value = mesocycle?.template || 'mesocycle-1';

    document.getElementById('delete-mesocycle').style.display = isEdit ? 'block' : 'none';

    document.getElementById('mesocycle-modal').classList.add('active');
}

function closeMesocycleModal() {
    document.getElementById('mesocycle-modal').classList.remove('active');
    appState.editingMesocycleId = null;
}

function saveMesocycle(e) {
    e.preventDefault();

    const name = document.getElementById('meso-name').value;
    const fromDate = document.getElementById('meso-from').value;
    const toDate = document.getElementById('meso-to').value;
    const template = document.getElementById('meso-template').value;

    if (appState.editingMesocycleId) {
        // Edit existing
        const meso = getMesocycle(appState.editingMesocycleId);
        meso.name = name;
        meso.fromDate = fromDate;
        meso.toDate = toDate;
        // Note: don't regenerate schedule on edit, just update metadata
    } else {
        // Create new
        const id = 'meso-' + Date.now();
        const mesocycle = {
            id,
            name,
            fromDate,
            toDate,
            template,
            schedule: [],
            logs: {}
        };

        // Generate schedule based on template
        if (template === 'mesocycle-1') {
            mesocycle.schedule = generateMesocycle1Schedule(fromDate, toDate);
        }

        appState.data.macrocycle.mesocycles.push(mesocycle);
    }

    saveData();
    closeMesocycleModal();
    renderMacrocycleView();
}

function deleteMesocycle() {
    if (!confirm('Are you sure you want to delete this mesocycle?')) return;

    appState.data.macrocycle.mesocycles = appState.data.macrocycle.mesocycles
        .filter(m => m.id !== appState.editingMesocycleId);

    saveData();
    closeMesocycleModal();
    showView('macrocycle-view');
    renderMacrocycleView();
}

// ============================================
// MESOCYCLE 1 SCHEDULE GENERATOR
// ============================================

function generateMesocycle1Schedule(fromDateStr, toDateStr) {
    const schedule = [];
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);

    // Calculate weeks
    const totalDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(totalDays / 7);

    // Progression trackers
    let pressUpCount = 0;
    let chinUpCount = 0;
    let dipsCount = 0;
    let rowsCount = 0;
    let hyroxCount = 0;

    // 1km run progression: starts at 5:00, reduces by 5s on second Hyrox each week
    const baseRunTime = 300; // 5:00 in seconds

    for (let week = 0; week < weeks; week++) {
        const weekStart = new Date(fromDate);
        weekStart.setDate(fromDate.getDate() + week * 7);

        let weeklyHyroxCount = 0;

        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + day);

            if (currentDate > toDate) break;

            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

            // Monday: Lower hypertrophy + GTG
            if (dayOfWeek === 1) {
                // Lower hypertrophy
                schedule.push({
                    id: `${dateStr}-lower`,
                    date: dateStr,
                    type: 'lower-hypertrophy',
                    title: 'Lower Body Hypertrophy',
                    goal: null,
                    exercises: LOWER_BODY_TEMPLATE.map(ex => ({...ex})),
                    completed: false,
                    notes: '',
                    rpe: null
                });

                // Third grappling session (consistent across all weeks)
                schedule.push({
                    id: `${dateStr}-grappling-3`,
                    date: dateStr,
                    type: 'grappling',
                    title: 'Grappling Solo Training',
                    goal: 4,
                    completed: false,
                    notes: '',
                    rpe: null
                });
            }

            // Tuesday: Half Hyrox #1 + GTG
            if (dayOfWeek === 2) {
                weeklyHyroxCount++;
                hyroxCount++;

                schedule.push({
                    id: `${dateStr}-hyrox-1`,
                    date: dateStr,
                    type: 'hyrox',
                    title: 'Hyrox Simulation',
                    variant: 'Half',
                    goal: 3,
                    runTarget: null,
                    completed: false,
                    notes: '',
                    rpe: null
                });
            }

            // Wednesday: Grappling + GTG
            if (dayOfWeek === 3) {
                schedule.push({
                    id: `${dateStr}-grappling`,
                    date: dateStr,
                    type: 'grappling',
                    title: 'Grappling Solo Training',
                    goal: 4,
                    completed: false,
                    notes: '',
                    rpe: null
                });
            }

            // Thursday: Jump session + GTG
            if (dayOfWeek === 4) {
                schedule.push({
                    id: `${dateStr}-jump`,
                    date: dateStr,
                    type: 'jump',
                    title: 'Basketball Jump Training',
                    goal: 1,
                    completed: false,
                    notes: '',
                    rpe: null
                });
            }

            // Friday: Half Hyrox #2 (with 1km run progression) + GTG
            if (dayOfWeek === 5) {
                weeklyHyroxCount++;
                hyroxCount++;

                // Calculate 1km run target: reduce by 5s on second Hyrox each week
                const runTimeSeconds = baseRunTime - (week * 5);
                const runTarget = formatTime(runTimeSeconds);

                schedule.push({
                    id: `${dateStr}-hyrox-2`,
                    date: dateStr,
                    type: 'hyrox',
                    title: 'Hyrox Simulation',
                    variant: 'Half',
                    goal: 3,
                    runTarget: runTarget,
                    completed: false,
                    notes: '',
                    rpe: null
                });
            }

            // Saturday: Grappling + GTG
            if (dayOfWeek === 6) {
                schedule.push({
                    id: `${dateStr}-grappling-2`,
                    date: dateStr,
                    type: 'grappling',
                    title: 'Grappling Solo Training',
                    goal: 4,
                    completed: false,
                    notes: '',
                    rpe: null
                });
            }

            // Week 4: Add 1x Full Hyrox (in addition to the half Hyrox sessions)
            if (week === 3 && dayOfWeek === 0) { // Sunday of week 4
                schedule.push({
                    id: `${dateStr}-hyrox-full`,
                    date: dateStr,
                    type: 'hyrox',
                    title: 'Hyrox Simulation',
                    variant: 'Full',
                    goal: 3,
                    runTarget: null,
                    completed: false,
                    notes: '',
                    rpe: null
                });
            }

            // GTG sessions: Mon-Sat (skip Sunday)
            if (dayOfWeek >= 1 && dayOfWeek <= 6) {
                const isADay = (day % 2 === 0); // Alternating A/B

                let movements;
                if (isADay) {
                    // Day A: Press-ups + Chin-ups
                    movements = [
                        {
                            name: 'Press-ups',
                            target: 10 + (pressUpCount * 2),
                            completed: [false, false, false]
                        },
                        {
                            name: 'Chin-ups',
                            target: 1 + chinUpCount,
                            completed: [false, false]
                        }
                    ];
                    pressUpCount++;
                    chinUpCount++;
                } else {
                    // Day B: Dips + KB Rows
                    movements = [
                        {
                            name: 'Dips',
                            target: 1 + dipsCount,
                            completed: [false, false, false]
                        },
                        {
                            name: 'Bent-over Rows (24kg, each side)',
                            target: 6 + (rowsCount * 2),
                            completed: [false, false]
                        }
                    ];
                    dipsCount++;
                    rowsCount++;
                }

                schedule.push({
                    id: `${dateStr}-gtg`,
                    date: dateStr,
                    type: 'gtg',
                    title: `GTG ${isADay ? 'A' : 'B'}`,
                    goal: 2,
                    movements: movements,
                    completed: false,
                    notes: ''
                });
            }
        }
    }

    return schedule;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getMesocycle(id) {
    return appState.data.macrocycle.mesocycles.find(m => m.id === id);
}

// ============================================
// EXPORT / IMPORT
// ============================================

function exportData() {
    const dataStr = JSON.stringify(appState.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `macrocycle-2026-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (confirm('This will replace all current data. Continue?')) {
                appState.data = imported;
                saveData();
                renderMacrocycleView();
                alert('Data imported successfully!');
            }
        } catch (err) {
            alert('Error importing file: ' + err.message);
        }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
}
