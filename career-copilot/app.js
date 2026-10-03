// ============================================================
// AI Career Copilot — Full Interactive Application
// All buttons working, localStorage auth, career detail panel,
// full skill assessment → gap analysis pipeline, and more.
// ============================================================

// ══════════════════════════════════════════════════════════════
// APP STATE
// ══════════════════════════════════════════════════════════════
const state = {
  currentView: 'home',
  user:        null,    // { name, email }
  analysis:    null,    // result from analyzeCareer()
  skillLevels: {},      // { skillName: 'Beginner'|'Intermediate'|'Advanced'|'None' }
  selectedCareerDetail: null, // career name for detail panel
};

// ══════════════════════════════════════════════════════════════
// LOCAL STORAGE  —  AUTH PERSISTENCE
// ══════════════════════════════════════════════════════════════
const LS_USER     = 'cc_user';
const LS_ANALYSIS = 'cc_analysis';
const LS_SKILLS   = 'cc_skillLevels';

function lsSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

function lsLoad(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (_) { return null; }
}

function lsRemove(key) {
  try { localStorage.removeItem(key); } catch (_) {}
}

function restoreSession() {
  const user     = lsLoad(LS_USER);
  const analysis = lsLoad(LS_ANALYSIS);
  const skills   = lsLoad(LS_SKILLS);

  if (user)     { state.user = user;     applyLoggedInUI(user); }
  if (analysis && typeof CAREER_PROFILES !== 'undefined' && CAREER_PROFILES[analysis.bestCareer]) {
    // Re-attach the full career object from data.js (not from localStorage)
    analysis.career = CAREER_PROFILES[analysis.bestCareer];
    analysis.recommendations = analysis.recommendations || [];
    state.analysis = analysis;
    renderRecommendations();
    renderSkillGapView();
    renderRoadmapView();
    renderCoursesView();
    renderDashboard();
  }
  if (skills)   { state.skillLevels = skills; }
}

// ══════════════════════════════════════════════════════════════
// VIEW NAVIGATION
// ══════════════════════════════════════════════════════════════
function showView(viewId) {
  // Hide career detail panel if switching away
  hideCareerDetail();

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById('view-' + viewId);
  if (viewEl) viewEl.classList.add('active');

  const navEl = document.getElementById('nav-' + viewId);
  if (navEl) navEl.classList.add('active');

  const labels = {
    home:            'Home',
    search:          'Career Search',
    categories:      'Career Categories',
    recommendations: 'Recommendations',
    profile:         'My Profile',
    skillassess:     'Skill Assessment',
    skillgap:        'Skill Gap Analysis',
    roadmap:         'Learning Roadmap',
    courses:         'Course Recommendations',
    resume:          'Resume Guidance',
    dashboard:       'Student Dashboard',
    about:           'About',
  };

  const labelEl = document.getElementById('currentViewLabel');
  if (labelEl) labelEl.textContent = labels[viewId] || viewId;

  state.currentView = viewId;

  // Lazy-render views that build their content once
  if (viewId === 'resume')      renderResumeGuidance();
  if (viewId === 'skillassess') renderSkillAssessment();
  if (viewId === 'categories')  renderCareerCategories();
  if (viewId === 'search')      initCareerSearch();

  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════════════
// SIDEBAR  (mobile)
// ══════════════════════════════════════════════════════════════
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// ══════════════════════════════════════════════════════════════
// THEME TOGGLE
// ══════════════════════════════════════════════════════════════
function toggleTheme(checkbox) {
  document.documentElement.setAttribute('data-theme', checkbox.checked ? 'light' : 'dark');
  const label = document.querySelector('.theme-label');
  if (label) label.textContent = checkbox.checked ? '☀️ Light Mode' : '🌙 Dark Mode';
  try { localStorage.setItem('cc_theme', checkbox.checked ? 'light' : 'dark'); } catch (_) {}
}

function restoreTheme() {
  try {
    const t = localStorage.getItem('cc_theme');
    if (t === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      const chk = document.getElementById('themeToggle');
      if (chk) chk.checked = true;
      const label = document.querySelector('.theme-label');
      if (label) label.textContent = '☀️ Light Mode';
    }
  } catch (_) {}
}

// ══════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
function showToast(message, icon = '✅', duration = 3200) {
  const toast   = document.getElementById('toast');
  const msgEl   = document.getElementById('toastMsg');
  const iconEl  = document.getElementById('toastIcon');
  if (!toast || !msgEl || !iconEl) return;
  msgEl.textContent  = message;
  iconEl.textContent = icon;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ══════════════════════════════════════════════════════════════
// AUTH MODAL
// ══════════════════════════════════════════════════════════════
function openAuthModal() {
  document.getElementById('authModal').classList.remove('hidden');
  showLoginPanel();
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function showLoginPanel() {
  document.getElementById('loginPanel').classList.remove('hidden');
  document.getElementById('signupPanel').classList.add('hidden');
}

function showSignupPanel() {
  document.getElementById('signupPanel').classList.remove('hidden');
  document.getElementById('loginPanel').classList.add('hidden');
}

// ── Login ────────────────────────────────────────────────────
function loginUser() {
  const email    = (document.getElementById('loginEmail').value    || '').trim();
  const password = (document.getElementById('loginPassword').value  || '').trim();

  if (!email)    { shakeField('loginEmail',    'Please enter your email.');    return; }
  if (!password) { shakeField('loginPassword', 'Please enter your password.'); return; }

  // Check localStorage for registered account
  const accounts = lsLoad('cc_accounts') || {};
  if (accounts[email] && accounts[email].password === password) {
    const user = { name: accounts[email].name, email };
    lsSave(LS_USER, user);
    setLoggedInUser(user);
    closeAuthModal();
    showToast(`Welcome back, ${user.name}! 👋`);
  } else if (!accounts[email]) {
    // Auto-create guest session (demo mode — no real backend)
    const name = capitalize(email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Student');
    const user = { name, email };
    lsSave(LS_USER, user);
    setLoggedInUser(user);
    closeAuthModal();
    showToast(`Welcome, ${name}! (Demo login — no password set) 👋`, '🎓');
  } else {
    shakeField('loginPassword', 'Incorrect password.');
    showToast('Incorrect password. Please try again.', '❌');
  }
}

// ── Register ─────────────────────────────────────────────────
function createAccount() {
  const name    = (document.getElementById('signupName').value      || '').trim();
  const email   = (document.getElementById('signupEmail').value     || '').trim();
  const pass    = (document.getElementById('signupPassword').value  || '').trim();
  const confirm = (document.getElementById('confirmPassword').value || '').trim();

  if (!name)    { shakeField('signupName',    'Please enter your full name.'); return; }
  if (!email)   { shakeField('signupEmail',   'Please enter your email.');     return; }
  if (!pass)    { shakeField('signupPassword','Please create a password.');    return; }
  if (pass !== confirm) {
    shakeField('confirmPassword', 'Passwords do not match.');
    showToast('Passwords do not match.', '❌');
    return;
  }
  if (pass.length < 6) {
    shakeField('signupPassword', 'Password must be at least 6 characters.');
    showToast('Password too short — minimum 6 characters.', '⚠️');
    return;
  }

  // Save account to localStorage
  const accounts = lsLoad('cc_accounts') || {};
  accounts[email] = { name, password: pass };
  lsSave('cc_accounts', accounts);

  const user = { name, email };
  lsSave(LS_USER, user);
  setLoggedInUser(user);
  closeAuthModal();
  showToast(`Account created! Welcome aboard, ${name}! 🎉`);
}

// ── Apply logged-in UI ───────────────────────────────────────
function setLoggedInUser(user) {
  state.user = user;
  applyLoggedInUI(user);
  const nameInput = document.getElementById('studentName');
  if (nameInput && !nameInput.value) nameInput.value = user.name;
}

function applyLoggedInUI(user) {
  const sidebarInfo = document.getElementById('sidebarUserInfo');
  if (sidebarInfo) {
    sidebarInfo.innerHTML = `
      <div class="sidebar-user-card">
        <div class="user-avatar">👤</div>
        <div style="min-width:0;">
          <div class="user-name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(user.name)}</div>
          <div class="user-email" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(user.email)}</div>
        </div>
      </div>
      <button class="btn btn-secondary btn-full btn-sm" onclick="logoutUser()" style="margin-top:8px;">Sign Out</button>
    `;
  }
  const topBtn = document.getElementById('topNavAuthBtn');
  if (topBtn) {
    topBtn.textContent = '👤 ' + user.name;
    topBtn.onclick = () => showView('dashboard');
  }
}

function logoutUser() {
  lsRemove(LS_USER);
  lsRemove(LS_ANALYSIS);
  state.user     = null;
  state.analysis = null;
  location.reload();
}

// ── Field shake / error helper ───────────────────────────────
function shakeField(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = 'var(--danger)';
  el.placeholder = msg;
  el.classList.add('shake-field');
  setTimeout(() => {
    el.style.borderColor = '';
    el.classList.remove('shake-field');
  }, 700);
}

// ══════════════════════════════════════════════════════════════
// CHIP TOGGLE
// ══════════════════════════════════════════════════════════════
function toggleChip(chip) {
  chip.classList.toggle('selected');
}

// ══════════════════════════════════════════════════════════════
// LOAD SKILLS INTO PROFILE FORM
// ══════════════════════════════════════════════════════════════
function loadSkills() {
  const container = document.getElementById('skillsContainer');
  if (!container || typeof ALL_SKILLS === 'undefined') return;
  container.innerHTML = '';
  ALL_SKILLS.forEach(skill => {
    const chip = document.createElement('span');
    chip.className   = 'chip skill-chip';
    chip.dataset.val = skill.name;
    chip.textContent = skill.name;
    chip.title       = skill.category;
    chip.onclick     = () => toggleChip(chip);
    container.appendChild(chip);
  });
}

function getSelectedSkills() {
  return Array.from(document.querySelectorAll('.skill-chip.selected')).map(c => c.dataset.val);
}

function getSelectedInterests() {
  return Array.from(document.querySelectorAll('.interest-chip.selected')).map(c => c.dataset.val);
}

// ══════════════════════════════════════════════════════════════
// CAREER ANALYSIS  (core engine)
// ══════════════════════════════════════════════════════════════
function analyzeCareer() {
  const studentName      = (document.getElementById('studentName').value  || '').trim();
  const branch           = (document.getElementById('branch').value        || '');
  const year             = (document.getElementById('year').value          || '');
  const selectedSkills   = getSelectedSkills();
  const selectedInterests= getSelectedInterests();
  const careerGoal       = (document.getElementById('careerGoal').value   || 'Undecided');

  // Validation
  if (!studentName) { shakeField('studentName', 'Enter your name'); showToast('Please enter your name.', '⚠️'); return; }
  if (!branch)      { showToast('Please select your branch.', '⚠️'); return; }
  if (!year)        { showToast('Please select your year of study.', '⚠️'); return; }

  // Animate button
  const btn = document.getElementById('analyzeBtn');
  if (btn) { btn.textContent = '⏳ Analyzing…'; btn.disabled = true; }

  setTimeout(() => {
    if (btn) { btn.textContent = '🔍 Analyze My Career'; btn.disabled = false; }

    const scores = {};
    Object.entries(CAREER_PROFILES).forEach(([careerName, career]) => {
      let score = 0;
      if (career.requiredSkills) {
        career.requiredSkills.forEach(skill => {
          if (selectedSkills.map(s => s.toLowerCase()).includes(skill.name.toLowerCase())) {
            score += skill.level;
          }
        });
      }
      // Interest-based bonus
      selectedInterests.forEach(interest => {
        const interestMap = {
          AI: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist'],
          Data: ['Data Scientist', 'Data Analyst'],
          Programming: ['Software Developer', 'Machine Learning Engineer'],
          Research: ['Data Scientist', 'AI Engineer'],
          Business: ['Data Analyst'],
          Web: ['Software Developer'],
          Mobile: ['Software Developer'],
          Cloud: ['Machine Learning Engineer', 'Software Developer'],
          Security: ['Software Developer'],
        };
        if (interestMap[interest] && interestMap[interest].includes(careerName)) score += 40;
      });
      // Explicit goal bonus
      if (careerGoal !== 'Undecided' && careerName === careerGoal) score += 120;
      // Skill-assessment level bonus
      Object.entries(state.skillLevels).forEach(([skillId, level]) => {
        const levelBonus = { None: 0, Beginner: 5, Intermediate: 15, Advanced: 30 };
        const bonus = levelBonus[level] || 0;
        if (career.requiredSkills && career.requiredSkills.some(s => sanitizeId(s.name) === skillId)) {
          score += bonus;
        }
      });
      scores[careerName] = score;
    });

    const recommendations = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [bestCareer, bestScore] = recommendations[0];
    const career = CAREER_PROFILES[bestCareer];

    state.analysis = { studentName, branch, year, bestCareer, bestScore, career, selectedSkills, selectedInterests, recommendations };
    lsSave(LS_ANALYSIS, { studentName, branch, year, bestCareer, bestScore, selectedSkills, selectedInterests, recommendations });

    updateStepIndicator(3);
    renderRecommendations();
    renderSkillGapView();
    renderRoadmapView();
    renderCoursesView();
    renderDashboard();

    showToast(`Analysis complete! Best match: ${bestCareer} 🎯`);
    showView('recommendations');
  }, 800);
}

// ══════════════════════════════════════════════════════════════
// STEP INDICATOR
// ══════════════════════════════════════════════════════════════
function updateStepIndicator(completedStep) {
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById('stepCircle' + i);
    const line   = document.getElementById('stepLine'   + i);
    if (!circle) continue;
    if (i < completedStep) {
      circle.className   = 'step-circle done';
      circle.textContent = '✓';
    } else if (i === completedStep) {
      circle.className = 'step-circle active';
    }
    if (line && i < completedStep) line.classList.add('done');
  }
}

// ══════════════════════════════════════════════════════════════
// CAREER DETAIL PANEL  (shown when a career card is clicked)
// ══════════════════════════════════════════════════════════════
function showCareerDetail(careerName) {
  const career = CAREER_PROFILES[careerName];
  if (!career) return;

  state.selectedCareerDetail = careerName;

  // Remove old panel if any
  const existing = document.getElementById('careerDetailPanel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id        = 'careerDetailPanel';
  panel.className = 'career-detail-panel';

  panel.innerHTML = `
    <div class="career-detail-overlay" onclick="hideCareerDetail()"></div>
    <div class="career-detail-box">
      <div class="career-detail-header" style="background:${career.gradient || 'var(--accent-grad)'}">
        <button class="career-detail-close" onclick="hideCareerDetail()" title="Close">✕</button>
        <div class="career-detail-hero">
          <div style="font-size:48px;margin-bottom:12px;">${career.icon}</div>
          <h2 class="career-detail-title">${escHtml(careerName)}</h2>
          <p style="color:rgba(255,255,255,0.85);font-size:14px;line-height:1.6;max-width:560px;">${escHtml(career.description)}</p>
          <div class="career-detail-badges">
            <span class="det-badge">💰 ${career.avgSalary} avg</span>
            <span class="det-badge">📈 ${career.jobGrowth} growth</span>
            <span class="det-badge">🔥 ${career.demandLevel} demand</span>
          </div>
        </div>
      </div>

      <div class="career-detail-body">

        <!-- Required Skills -->
        <div class="det-section">
          <h3 class="det-section-title">🧠 Required Skills</h3>
          ${career.requiredSkills.map(s => `
            <div class="skill-bar-wrap">
              <div class="skill-bar-header">
                <div><span class="skill-bar-name">${escHtml(s.name)}</span>
                <span class="skill-bar-cat" style="margin-left:8px;">${escHtml(s.category)}</span></div>
                <span class="skill-bar-pct">${s.level}%</span>
              </div>
              <div class="skill-track">
                <div class="skill-fill" data-width="${s.level}%" style="width:0%"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Tools -->
        <div class="det-section">
          <h3 class="det-section-title">🛠️ Tools & Technologies</h3>
          <div class="tools-grid" style="margin-top:12px;">
            ${career.tools.map(t => `<span class="tool-chip">${escHtml(t)}</span>`).join('')}
          </div>
        </div>

        <!-- Roadmap -->
        <div class="det-section">
          <h3 class="det-section-title">🗺️ Learning Roadmap</h3>
          <div class="roadmap-timeline" style="margin-top:16px;">
            ${career.roadmap.map((phase, i) => `
              <div class="roadmap-phase">
                <div class="phase-header">
                  <span class="phase-num">Phase ${i + 1}</span>
                  <span class="phase-name">${escHtml(phase.phase)}</span>
                  <span class="phase-duration">${escHtml(phase.duration)}</span>
                </div>
                <div class="phase-topics">
                  ${phase.topics.map(t => `<span class="topic-chip">${escHtml(t)}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Projects -->
        <div class="det-section">
          <h3 class="det-section-title">💻 Recommended Projects</h3>
          <div class="project-grid" style="margin-top:12px;">
            ${career.projects.map(p => `
              <div class="project-card">
                <div class="project-header">
                  <span class="project-name">${escHtml(p.name)}</span>
                  <span class="difficulty-badge ${p.difficulty}">${p.difficulty}</span>
                </div>
                <p class="project-desc">${escHtml(p.description)}</p>
                <div class="tech-tags">
                  ${p.tech.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Top Companies -->
        <div class="det-section">
          <h3 class="det-section-title">🏢 Top Companies Hiring</h3>
          <div class="companies-row" style="margin-top:12px;">
            ${career.topCompanies.map(c => `<span class="company-tag">${escHtml(c)}</span>`).join('')}
          </div>
        </div>

        <!-- CTA -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px;padding-top:20px;border-top:1px solid var(--border);">
          <button class="btn btn-primary btn-lg" onclick="startCareerPath('${escHtml(careerName)}')" id="detailStartBtn">
            🚀 Start This Career Path
          </button>
          <button class="btn btn-secondary" onclick="hideCareerDetail()" id="detailCloseBtn">
            ← Back to Careers
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  document.body.style.overflow = 'hidden';

  // Animate skill bars
  requestAnimationFrame(() => {
    setTimeout(() => {
      panel.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }, 200);
  });
}

function hideCareerDetail() {
  const panel = document.getElementById('careerDetailPanel');
  if (panel) {
    panel.classList.add('closing');
    setTimeout(() => { panel.remove(); }, 250);
  }
  document.body.style.overflow = '';
}

function startCareerPath(careerName) {
  hideCareerDetail();
  // Pre-fill career goal in profile
  const goalSelect = document.getElementById('careerGoal');
  if (goalSelect) {
    for (const opt of goalSelect.options) {
      if (opt.value === careerName) { goalSelect.value = careerName; break; }
    }
  }
  showView('profile');
  showToast(`Career path set to ${careerName}! Complete your profile to get your roadmap. 🎯`);
}

// ══════════════════════════════════════════════════════════════
// RENDER: CAREER RECOMMENDATIONS
// ══════════════════════════════════════════════════════════════
function renderRecommendations() {
  const container = document.getElementById('recommendationContent');
  if (!container || !state.analysis) return;

  const { studentName, bestCareer, bestScore, career, selectedInterests, recommendations } = state.analysis;

  const maxPossible = career.requiredSkills.reduce((sum, s) => sum + s.level, 0) + 120;
  const rawPct    = Math.min(Math.round((bestScore / maxPossible) * 100), 99);
  const matchPct  = Math.max(rawPct, 8);
  const r         = 36;
  const circ      = 2 * Math.PI * r;
  const offset    = circ - (matchPct / 100) * circ;

  container.innerHTML = `
    <div class="rec-hero">
      <div class="rec-greeting">Hey, ${escHtml(studentName)}! Here's your AI Career Analysis</div>
      <div class="match-ring-wrap">
        <div class="match-ring">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#7c3aed"/>
                <stop offset="100%" stop-color="#3b82f6"/>
              </linearGradient>
            </defs>
            <circle class="match-ring-bg" cx="45" cy="45" r="${r}"/>
            <circle class="match-ring-fill" id="matchRingFill"
              cx="45" cy="45" r="${r}"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${circ}"
            />
          </svg>
          <div class="match-ring-text" id="matchRingText">0%</div>
        </div>
        <div>
          <div class="rec-greeting" style="margin-bottom:4px;">Career Match Score</div>
          <div class="rec-career-name">${escHtml(bestCareer)}</div>
        </div>
      </div>
      <p class="rec-desc">${escHtml(career.description)}</p>
      <div class="rec-stats">
        <div class="rec-stat">
          <div class="rec-stat-val">${career.avgSalary}</div>
          <div class="rec-stat-label">Avg. Salary</div>
        </div>
        <div class="rec-stat">
          <div class="rec-stat-val">${career.jobGrowth}</div>
          <div class="rec-stat-label">Job Growth</div>
        </div>
        <div class="rec-stat">
          <div class="rec-stat-val">${career.demandLevel}</div>
          <div class="rec-stat-label">Demand Level</div>
        </div>
      </div>
    </div>

    ${selectedInterests.length > 0 ? `
    <div class="card" style="margin-bottom:20px;">
      <h3 class="section-title" style="font-size:16px;margin-bottom:12px;">Your Interests</h3>
      <div class="chip-grid">
        ${selectedInterests.map(i => `<span class="chip selected">${escHtml(i)}</span>`).join('')}
      </div>
    </div>` : ''}

    <div class="card" style="margin-bottom:20px;">
      <h3 class="section-title" style="font-size:16px;margin-bottom:12px;">🏢 Top Companies Hiring</h3>
      <div class="companies-row">
        ${career.topCompanies.map(c => `<span class="company-tag">${escHtml(c)}</span>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <h3 class="section-title" style="font-size:16px;margin-bottom:16px;">🛠️ Required Tools & Technologies</h3>
      <div class="tools-grid">
        ${career.tools.map(t => `<span class="tool-chip">${escHtml(t)}</span>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <h3 class="section-title" style="font-size:16px;margin-bottom:16px;">📋 All Career Match Scores</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${recommendations.map(([name, score], idx) => {
          const c   = CAREER_PROFILES[name];
          if (!c) return '';
          const max = c.requiredSkills.reduce((s, r) => s + r.level, 0) + 120;
          const pct = Math.max(Math.min(Math.round((score / max) * 100), 99), idx === 0 ? 1 : 0);
          return `
            <div style="display:flex;align-items:center;gap:14px;padding:12px 16px;
              background:var(--bg-surface);border:1px solid ${idx===0?'var(--border-accent)':'var(--border)'};
              border-radius:var(--radius-sm);cursor:pointer;transition:all .2s"
              onclick="showCareerDetail('${escHtml(name)}')"
              onmouseenter="this.style.borderColor='var(--border-accent)'"
              onmouseleave="this.style.borderColor='${idx===0?'var(--border-accent)':'var(--border)'}'">
              <span style="font-size:22px;">${c.icon}</span>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:14px;margin-bottom:5px;display:flex;align-items:center;gap:8px;">
                  ${escHtml(name)}
                  ${idx===0?'<span style="font-size:11px;background:var(--accent-grad);color:white;padding:2px 8px;border-radius:20px;font-weight:700;">Best Match</span>':''}
                </div>
                <div class="skill-track"><div class="skill-fill" style="width:${Math.max(pct,3)}%;"></div></div>
              </div>
              <div style="font-weight:700;font-size:13px;color:var(--accent-light);min-width:38px;text-align:right;">${pct}%</div>
              <div style="font-size:13px;color:var(--text-muted);">→</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
      <button class="btn btn-secondary" onclick="showView('skillgap')" id="recToSkillGapBtn">
        📊 View My Skill Gap
      </button>
      <button class="btn btn-secondary" onclick="showView('roadmap')" id="recToRoadmapBtn">
        🗺️ See Learning Roadmap
      </button>
      <button class="btn btn-outline" onclick="showView('profile')" id="recReanalyzeBtn">
        🔄 Re-analyze
      </button>
    </div>
  `;

  // Animate the ring
  requestAnimationFrame(() => {
    setTimeout(() => {
      const fill = document.getElementById('matchRingFill');
      const text = document.getElementById('matchRingText');
      if (fill) fill.style.strokeDashoffset = offset;
      if (text) {
        let count = 0;
        const iv = setInterval(() => {
          count += 2;
          if (count >= matchPct) { count = matchPct; clearInterval(iv); }
          text.textContent = count + '%';
        }, 18);
      }
    }, 150);
  });
}

// ══════════════════════════════════════════════════════════════
// RENDER: SKILL GAP VIEW
// ══════════════════════════════════════════════════════════════
function renderSkillGapView() {
  const container = document.getElementById('skillGapView');
  if (!container) return;

  if (!state.analysis) {
    // Show a quick-analyze option if there's saved partial info
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-title">No Analysis Yet</div>
        <p class="empty-state-desc">Complete your profile and run the career analysis to see your skill gap.</p>
        <button class="btn btn-primary" style="margin-top:20px" onclick="showView('profile')" id="skillGapProfileBtn">
          Go to Profile →
        </button>
      </div>
    `;
    return;
  }

  const { career, selectedSkills, bestCareer } = state.analysis;
  const userSkills = selectedSkills.map(s => s.toLowerCase());
  const missing    = career.requiredSkills.filter(s => !userSkills.includes(s.name.toLowerCase()));
  const acquired   = career.requiredSkills.filter(s =>  userSkills.includes(s.name.toLowerCase()));

  container.innerHTML = `
    <div style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div>
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:18px;margin-bottom:4px;">
          Skill Gap for <span style="color:var(--accent-light)">${escHtml(bestCareer)}</span>
        </h3>
        <p style="color:var(--text-secondary);font-size:13px;">
          You have ${acquired.length} of ${career.requiredSkills.length} required skills
          (${Math.round(acquired.length/career.requiredSkills.length*100)}% ready)
        </p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="showView('skillassess')" id="gapToAssessBtn">
        🧠 Run Skill Assessment
      </button>
    </div>

    <div class="gap-legend">
      <div class="legend-item">
        <div class="legend-dot" style="background:linear-gradient(90deg,#10b981,#34d399)"></div>
        Skill you have
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background:linear-gradient(90deg,#ef4444,#f59e0b)"></div>
        Skill gap — need to learn
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <div style="margin-bottom:16px;">
        <h3 class="section-title" style="font-size:16px;">
          ✅ Skills You Have (${acquired.length})
        </h3>
      </div>
      ${acquired.length > 0
        ? acquired.map(s => skillBarHTML(s.name, s.level, 'has', s.category)).join('')
        : '<p style="color:var(--text-muted);font-size:13px;">No matching skills selected. <button class="link-btn" onclick="showView(\'profile\')">Go to Profile →</button></p>'
      }
    </div>

    <div class="card" style="margin-bottom:20px;">
      <div style="margin-bottom:16px;">
        <h3 class="section-title" style="font-size:16px;">
          ❌ Skills to Learn (${missing.length})
        </h3>
      </div>
      ${missing.length > 0
        ? missing.map(s => skillBarHTML(s.name, s.level, 'gap', s.category)).join('')
        : '<p style="color:var(--success);font-size:14px;font-weight:600;">🎉 You have all the required skills for this career!</p>'
      }
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="showView('roadmap')" id="gapToRoadmapBtn">
        🗺️ View Learning Roadmap
      </button>
      <button class="btn btn-secondary" onclick="showView('courses')" id="gapToCoursesBtn">
        📚 Find Courses
      </button>
    </div>
  `;

  // Animate bars
  requestAnimationFrame(() => {
    setTimeout(() => {
      container.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width || bar.style.width;
      });
    }, 120);
  });
}

function skillBarHTML(name, level, type, category) {
  return `
    <div class="skill-bar-wrap">
      <div class="skill-bar-header">
        <div>
          <span class="skill-bar-name">${escHtml(name)}</span>
          <span class="skill-bar-cat" style="margin-left:8px;">${escHtml(category || '')}</span>
        </div>
        <span class="skill-bar-pct">${level}%</span>
      </div>
      <div class="skill-track">
        <div class="skill-fill ${type}" data-width="${level}%" style="width:0%"></div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════
// RENDER: LEARNING ROADMAP VIEW
// ══════════════════════════════════════════════════════════════
function renderRoadmapView() {
  const container = document.getElementById('roadmapView');
  if (!container) return;

  if (!state.analysis) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🗺️</div>
        <div class="empty-state-title">Roadmap Not Generated Yet</div>
        <p class="empty-state-desc">Complete your profile analysis to get your personalized roadmap.</p>
        <button class="btn btn-primary" style="margin-top:20px" onclick="showView('profile')" id="roadmapProfileBtn">
          Go to Profile →
        </button>
      </div>
    `;
    return;
  }

  const { bestCareer, career } = state.analysis;

  container.innerHTML = `
    <div class="card" style="margin-bottom:24px;padding:28px 32px;">
      <div style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <h3 class="section-title">🗺️ Roadmap for ${escHtml(bestCareer)}</h3>
          <p class="section-desc">Follow these phases step by step to reach your career goal.</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="showView('profile')" id="roadmapChangeBtn">
          Change Career
        </button>
      </div>
      <div class="roadmap-timeline">
        ${career.roadmap.map((phase, i) => `
          <div class="roadmap-phase">
            <div class="phase-header">
              <span class="phase-num">Phase ${i + 1}</span>
              <span class="phase-name">${escHtml(phase.phase)}</span>
              <span class="phase-duration">${escHtml(phase.duration)}</span>
            </div>
            <div class="phase-topics">
              ${phase.topics.map(t => `<span class="topic-chip">${escHtml(t)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <div style="margin-bottom:16px;">
        <h3 class="section-title" style="font-size:16px;">💻 Recommended Projects</h3>
        <p class="section-desc">Build these to strengthen your portfolio for ${escHtml(bestCareer)} roles.</p>
      </div>
      <div class="project-grid">
        ${career.projects.map(p => `
          <div class="project-card">
            <div class="project-header">
              <span class="project-name">${escHtml(p.name)}</span>
              <span class="difficulty-badge ${p.difficulty}">${p.difficulty}</span>
            </div>
            <p class="project-desc">${escHtml(p.description)}</p>
            <div class="tech-tags">
              ${p.tech.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="showView('courses')" id="roadmapToCoursesBtn">
        📚 Find Courses for This Roadmap
      </button>
      <button class="btn btn-secondary" onclick="showView('skillgap')" id="roadmapToSkillGapBtn">
        📊 View Skill Gap
      </button>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════
// COURSE DATABASE + RENDER
// ══════════════════════════════════════════════════════════════
const COURSE_DB = {
  'Data Scientist': [
    { platform:'Coursera',        title:'IBM Data Science Professional Certificate',              desc:'A 9-course series covering Python, SQL, data analysis, machine learning, and data visualization.',        duration:'4 months',  level:'Beginner',     url:'https://www.coursera.org/professional-certificates/ibm-data-science' },
    { platform:'Udemy',           title:'Python for Data Science & Machine Learning Bootcamp',   desc:'Comprehensive course covering NumPy, Pandas, Matplotlib, Seaborn, Plotly, and Scikit-learn.',             duration:'25 hours',  level:'Intermediate', url:'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/' },
    { platform:'fast.ai',         title:'Practical Deep Learning for Coders',                    desc:'Top-down approach to deep learning — PyTorch, CNNs, NLP, and tabular data.',                              duration:'8 weeks',   level:'Intermediate', url:'https://course.fast.ai/' },
    { platform:'Kaggle',          title:'Intro to Machine Learning',                             desc:'Hands-on course with real datasets. Learn decision trees, random forests, and model validation.',           duration:'5 hours',   level:'Beginner',     url:'https://www.kaggle.com/learn/intro-to-machine-learning' },
  ],
  'Machine Learning Engineer': [
    { platform:'DeepLearning.AI', title:'Machine Learning Specialization',                       desc:"Andrew Ng's updated course covering supervised/unsupervised learning and best practices.",                 duration:'3 months',  level:'Beginner',     url:'https://www.coursera.org/specializations/machine-learning-introduction' },
    { platform:'Udacity',         title:'Machine Learning Engineer Nanodegree',                  desc:'End-to-end ML engineering covering deployment, pipelines, and real projects.',                             duration:'4 months',  level:'Advanced',     url:'https://www.udacity.com/course/machine-learning-engineer-nanodegree--nd009t' },
    { platform:'Coursera',        title:'MLOps Specialization by DeepLearning.AI',               desc:'Build and maintain ML systems in production — CI/CD, monitoring, and cloud deployment.',                   duration:'4 months',  level:'Intermediate', url:'https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops' },
    { platform:'fast.ai',         title:'Practical Deep Learning (Part 2)',                      desc:'Build production-grade deep learning systems from scratch using PyTorch.',                                  duration:'10 weeks',  level:'Advanced',     url:'https://course.fast.ai/Lessons/part2.html' },
  ],
  'AI Engineer': [
    { platform:'DeepLearning.AI', title:'Prompt Engineering for Developers',                     desc:'Official guide to building powerful LLM applications using OpenAI APIs.',                                  duration:'5 hours',   level:'Beginner',     url:'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/' },
    { platform:'DeepLearning.AI', title:'LangChain for LLM Application Development',             desc:'Build LLM-powered applications using LangChain — chains, agents, memory, and RAG.',                       duration:'6 hours',   level:'Intermediate', url:'https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/' },
    { platform:'Coursera',        title:'AI for Everyone by Andrew Ng',                          desc:'Non-technical overview of AI for building AI strategy and understanding AI capabilities.',                  duration:'6 hours',   level:'Beginner',     url:'https://www.coursera.org/learn/ai-for-everyone' },
    { platform:'Hugging Face',    title:'NLP Course with Transformers',                          desc:'Deep dive into the Transformers library — fine-tuning, inference, and deployment.',                        duration:'12 hours',  level:'Advanced',     url:'https://huggingface.co/learn/nlp-course/chapter1/1' },
  ],
  'Data Analyst': [
    { platform:'Google',          title:'Google Data Analytics Professional Certificate',         desc:'8-course series covering data cleaning, analysis, visualization, and SQL.',                                duration:'6 months',  level:'Beginner',     url:'https://www.coursera.org/professional-certificates/google-data-analytics' },
    { platform:'Coursera',        title:'Data Visualization with Tableau Specialization',        desc:'Create compelling dashboards and visualizations using Tableau and data storytelling techniques.',           duration:'5 months',  level:'Intermediate', url:'https://www.coursera.org/specializations/data-visualization' },
    { platform:'Udemy',           title:'The Complete SQL Bootcamp 2024',                        desc:'Master SQL for data analysis — queries, joins, window functions, and performance optimization.',            duration:'9 hours',   level:'Beginner',     url:'https://www.udemy.com/course/the-complete-sql-bootcamp/' },
    { platform:'Microsoft',       title:'Data Analysis & Visualization with Power BI',           desc:'Official Microsoft course on building rich interactive reports with Power BI.',                             duration:'4 months',  level:'Intermediate', url:'https://www.edx.org/professional-certificate/microsoft-power-bi-data-analyst' },
  ],
  'Software Developer': [
    { platform:'The Odin Project', title:'Full Stack JavaScript Path',                           desc:'Free, open-source curriculum covering HTML, CSS, JavaScript, Node.js, React, and databases.',             duration:'12 months', level:'Beginner',     url:'https://www.theodinproject.com/paths/full-stack-javascript' },
    { platform:'Meta',            title:'Meta Front-End Developer Professional Certificate',     desc:'Build job-ready front-end skills with React, HTML, CSS, and UX/UI design.',                               duration:'7 months',  level:'Beginner',     url:'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
    { platform:'NeetCode',        title:'Data Structures & Algorithms for Beginners',            desc:'Master DSA concepts and LeetCode patterns to crack top tech interviews.',                                   duration:'20 hours',  level:'Intermediate', url:'https://neetcode.io/courses/dsa-for-beginners/0' },
    { platform:'Udemy',           title:'Node.js, Express, MongoDB & More: The Complete Bootcamp',desc:'Build scalable back-end APIs and apps with Node.js, including REST and authentication.',                  duration:'42 hours',  level:'Intermediate', url:'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/' },
  ],
};

function renderCoursesView() {
  const container = document.getElementById('coursesView');
  if (!container) return;

  if (!state.analysis) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-title">Courses Pending</div>
        <p class="empty-state-desc">Run your career analysis first to get personalized course recommendations.</p>
        <button class="btn btn-primary" style="margin-top:20px" onclick="showView('profile')" id="coursesProfileBtn">
          Go to Profile →
        </button>
      </div>
    `;
    return;
  }

  const { bestCareer } = state.analysis;
  const courses = COURSE_DB[bestCareer] || [];

  container.innerHTML = `
    <div style="margin-bottom:24px;">
      <span class="section-label">Curated for ${escHtml(bestCareer)}</span>
      <h2 class="section-title" style="margin-top:10px;">Recommended Courses</h2>
      <p class="section-desc">Hand-picked to build the exact skills needed for your career path.</p>
    </div>
    <div class="grid-2" style="margin-bottom:28px;">
      ${courses.map(c => `
        <div class="course-card">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <span class="course-platform">${escHtml(c.platform)}</span>
            <span style="font-size:11px;color:var(--text-muted);">${escHtml(c.level)}</span>
          </div>
          <div class="course-title">${escHtml(c.title)}</div>
          <p class="course-desc">${escHtml(c.desc)}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:8px;">
            <div class="course-meta">
              <span>⏱ ${escHtml(c.duration)}</span>
              <span>📊 ${escHtml(c.level)}</span>
            </div>
            <a href="${c.url}" target="_blank" rel="noopener noreferrer"
               class="btn btn-outline btn-sm" style="text-decoration:none;"
               onclick="showToast('Opening course in a new tab 📚', '🔗', 2000)">
              View Course →
            </a>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="card" style="padding:28px;">
      <h3 style="font-family:'Space Grotesk',sans-serif;margin-bottom:8px;">🔌 AI-Powered Course Finder</h3>
      <p style="color:var(--text-secondary);font-size:14px;line-height:1.7;margin-bottom:16px;">
        Connect an AI API to unlock real-time personalized course search — analyzing your exact skill gaps
        and sourcing courses from Coursera, edX, Udemy, YouTube, and more.
      </p>
      <div class="ai-placeholder-badge">
        <span>🔌</span> AI Course Finder — Connect your API key to enable
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════
// RENDER: STUDENT DASHBOARD
// ══════════════════════════════════════════════════════════════
function renderDashboard() {
  const container = document.getElementById('dashboardContent');
  if (!container) return;

  if (!state.analysis) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📈</div>
        <div class="empty-state-title">Dashboard Empty</div>
        <p class="empty-state-desc">Complete your career analysis to populate your dashboard.</p>
        <button class="btn btn-primary" style="margin-top:20px" onclick="showView('profile')" id="dashboardProfileBtn">
          Get Started →
        </button>
      </div>
    `;
    return;
  }

  const { studentName, bestCareer, career, selectedSkills, branch, year } = state.analysis;
  const acquired  = career.requiredSkills.filter(s => selectedSkills.map(x => x.toLowerCase()).includes(s.name.toLowerCase()));
  const missing   = career.requiredSkills.filter(s => !selectedSkills.map(x => x.toLowerCase()).includes(s.name.toLowerCase()));
  const readiness = Math.round((acquired.length / career.requiredSkills.length) * 100);

  const yearLabels = { '1':'1st Year','2':'2nd Year','3':'3rd Year','4':'4th Year' };

  container.innerHTML = `
    <div class="dashboard-hero">
      <div class="hero-greeting">Student Dashboard</div>
      <div class="hero-title">Welcome, ${escHtml(studentName)}! 🎓</div>
      <div class="hero-subtitle">${escHtml(branch)} · ${yearLabels[year] || 'Year '+year} · Target: <strong>${escHtml(bestCareer)}</strong></div>
    </div>

    <div class="grid-4" style="margin-bottom:28px;">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${career.avgSalary}</div>
        <div class="stat-label">Target Salary</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-value">${career.jobGrowth}</div>
        <div class="stat-label">Job Growth</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🧠</div>
        <div class="stat-value">${acquired.length}/${career.requiredSkills.length}</div>
        <div class="stat-label">Skills Acquired</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-value">${readiness}%</div>
        <div class="stat-label">Career Readiness</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:24px;">
      <div class="card">
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:16px;">📊 Career Readiness</h3>
        <div class="skill-bar-wrap">
          <div class="skill-bar-header">
            <span class="skill-bar-name">Overall Readiness</span>
            <span class="skill-bar-pct">${readiness}%</span>
          </div>
          <div class="skill-track">
            <div class="skill-fill has" style="width:${readiness}%;"></div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-top:16px;line-height:1.6;">
          You have <strong>${acquired.length}</strong> of the <strong>${career.requiredSkills.length}</strong> required skills.
          ${missing.length > 0
            ? `Focus on: <em>${missing.slice(0,3).map(s=>s.name).join(', ')}</em>${missing.length>3 ? ` and ${missing.length-3} more` : ''}.`
            : '🎉 Excellent! You are well-prepared for this career.'
          }
        </p>
      </div>

      <div class="card">
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:14px;">🏢 Top Hiring Companies</h3>
        <div class="companies-row">
          ${career.topCompanies.map(c => `<span class="company-tag">${escHtml(c)}</span>`).join('')}
        </div>
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:10px;margin-top:20px;">🛠️ Key Tools</h3>
        <div class="tools-grid" style="margin-top:0;">
          ${career.tools.slice(0,6).map(t => `<span class="tool-chip">${escHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:16px;">📅 Learning Roadmap Overview</h3>
      <div style="display:flex;flex-wrap:wrap;gap:12px;">
        ${career.roadmap.map((phase, i) => `
          <div style="flex:1;min-width:160px;padding:14px;background:var(--bg-surface);
            border:1px solid var(--border);border-radius:var(--radius-sm);">
            <div style="font-size:11px;color:var(--accent-light);font-weight:700;text-transform:uppercase;
              letter-spacing:.08em;margin-bottom:4px;">Phase ${i+1}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${escHtml(phase.phase)}</div>
            <div style="font-size:12px;color:var(--text-muted);">${escHtml(phase.duration)}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:16px;">🚀 Quick Actions</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="showView('skillgap')" id="dashSkillGapBtn">📊 Skill Gap</button>
        <button class="btn btn-secondary" onclick="showView('roadmap')" id="dashRoadmapBtn">🗺️ Roadmap</button>
        <button class="btn btn-secondary" onclick="showView('courses')" id="dashCoursesBtn">📚 Courses</button>
        <button class="btn btn-outline" onclick="showView('resume')" id="dashResumeBtn">📄 Resume Tips</button>
        <button class="btn btn-outline" onclick="showView('profile')" id="dashReanalyzeBtn">🔄 Re-analyze</button>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════
// RENDER: SKILL ASSESSMENT
// ══════════════════════════════════════════════════════════════
function renderSkillAssessment() {
  const container = document.getElementById('skillAssessGrid');
  if (!container || typeof ALL_SKILLS === 'undefined') return;

  // Always re-render (don't use early exit guard)
  container.innerHTML = ALL_SKILLS.map(skill => {
    const sid = sanitizeId(skill.name);
    const current = state.skillLevels[sid] || 'None';
    return `
      <div class="assess-card">
        <div class="assess-card-header">
          <span class="assess-skill-name">${escHtml(skill.name)}</span>
          <span class="assess-category">${escHtml(skill.category)}</span>
        </div>
        <div class="level-selector" id="levels_${sid}">
          ${['None','Beginner','Intermediate','Advanced'].map(lvl => `
            <button class="level-btn${current===lvl?' selected':''}"
              onclick="selectLevel(this,'${sid}','${lvl}')"
              data-val="${lvl}">${lvl === 'Intermediate' ? 'Inter.' : lvl}</button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function selectLevel(btn, skillId, level) {
  const group = document.getElementById('levels_' + skillId);
  if (!group) return;
  group.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.skillLevels[skillId] = level;
}

function saveSkillAssessment() {
  const rated = Object.entries(state.skillLevels).filter(([,v]) => v !== 'None');
  if (rated.length === 0) {
    showToast('Please rate at least one skill above "None".', '⚠️');
    return;
  }
  lsSave(LS_SKILLS, state.skillLevels);

  // Also sync assessed skills into the profile chips
  syncAssessedSkillsToProfile();

  showToast(`Saved ${rated.length} skill ratings! Now run your analysis to see the gap. ✅`);

  // Offer to go to analysis
  setTimeout(() => {
    if (confirm('Skill assessment saved! Go to My Profile to run your career analysis now?')) {
      showView('profile');
    }
  }, 500);
}

function syncAssessedSkillsToProfile() {
  // Select skill chips in the profile form that match assessed skills with level > None
  const profileChips = document.querySelectorAll('.skill-chip');
  profileChips.forEach(chip => {
    const sid = sanitizeId(chip.dataset.val || chip.textContent.trim());
    const level = state.skillLevels[sid];
    if (level && level !== 'None') {
      chip.classList.add('selected');
    }
  });
}

// ══════════════════════════════════════════════════════════════
// RENDER: CAREER CATEGORIES
// ══════════════════════════════════════════════════════════════
function renderCareerCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container || typeof CAREER_PROFILES === 'undefined') return;

  container.innerHTML = Object.entries(CAREER_PROFILES).map(([name, career]) => `
    <div class="career-card" id="careerCard_${sanitizeId(name)}">
      <div class="career-icon">${career.icon}</div>
      <div class="career-name">${escHtml(name)}</div>
      <p class="career-desc">${escHtml(career.description)}</p>
      <div class="career-meta">
        <span class="meta-badge salary">💰 ${career.avgSalary}</span>
        <span class="meta-badge growth">📈 ${career.jobGrowth} growth</span>
        <span class="meta-badge demand">🔥 ${career.demandLevel}</span>
      </div>
      <div class="companies-row" style="margin-top:12px;margin-bottom:16px;">
        ${career.topCompanies.slice(0,3).map(c => `<span class="company-tag">${escHtml(c)}</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="showCareerDetail('${escHtml(name)}')" id="viewDetail_${sanitizeId(name)}">
          View Details →
        </button>
        <button class="btn btn-secondary btn-sm" onclick="startCareerPath('${escHtml(name)}')" id="startPath_${sanitizeId(name)}">
          🚀 Start Path
        </button>
      </div>
    </div>
  `).join('');
}

function selectCareerCard(careerName) {
  showCareerDetail(careerName);
}

// ══════════════════════════════════════════════════════════════
// CAREER SEARCH
// ══════════════════════════════════════════════════════════════
function initCareerSearch() {
  const input = document.getElementById('careerSearchInput');
  if (!input) return;
  // Always show all results on first load
  searchCareers(input.value || '');
}

function searchCareers(query) {
  const container = document.getElementById('searchResults');
  if (!container || typeof CAREER_PROFILES === 'undefined') return;

  const q = (query || '').toLowerCase().trim();

  const results = Object.entries(CAREER_PROFILES).filter(([name, career]) => {
    if (!q) return true;
    return (
      name.toLowerCase().includes(q) ||
      career.description.toLowerCase().includes(q) ||
      career.requiredSkills.some(s => s.name.toLowerCase().includes(q)) ||
      career.tools.some(t => t.toLowerCase().includes(q))
    );
  });

  if (results.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;" class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No results for "${escHtml(query)}"</div>
        <p class="empty-state-desc">Try a skill name like "Python" or a role like "Data Scientist".</p>
        <button class="btn btn-secondary" style="margin-top:16px" onclick="document.getElementById('careerSearchInput').value='';searchCareers('');" id="clearSearchBtn">
          Clear Search
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(([name, career]) => `
    <div class="career-card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <span style="font-size:28px;">${career.icon}</span>
        <div>
          <div class="career-name" style="margin-bottom:4px;">${escHtml(name)}</div>
          <span class="meta-badge demand">${career.demandLevel}</span>
        </div>
      </div>
      <p class="career-desc">${escHtml(career.description)}</p>
      <div class="career-meta" style="margin-bottom:12px;">
        <span class="meta-badge salary">💰 ${career.avgSalary}</span>
        <span class="meta-badge growth">📈 ${career.jobGrowth}</span>
      </div>
      <div style="margin-bottom:14px;">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">Key Skills:</div>
        <div class="tech-tags">
          ${career.requiredSkills.slice(0,4).map(s => `<span class="tech-tag">${escHtml(s.name)}</span>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="showCareerDetail('${escHtml(name)}')" id="searchDetail_${sanitizeId(name)}">
          View Details →
        </button>
        <button class="btn btn-secondary btn-sm" onclick="startCareerPath('${escHtml(name)}')" id="searchStart_${sanitizeId(name)}">
          🚀 Start Path
        </button>
      </div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════════════
// HOME CATEGORY GRID
// ══════════════════════════════════════════════════════════════
function renderHomeCategoryGrid() {
  const container = document.getElementById('homeCategoryGrid');
  if (!container || typeof CAREER_PROFILES === 'undefined') return;

  const grads = [
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#0891b2,#06b6d4)',
    'linear-gradient(135deg,#dc2626,#f97316)',
    'linear-gradient(135deg,#059669,#10b981)',
    'linear-gradient(135deg,#d97706,#f59e0b)',
  ];

  container.innerHTML = Object.entries(CAREER_PROFILES).map(([name, career], i) => `
    <div class="mini-career-card" onclick="showCareerDetail('${escHtml(name)}')"
      style="--card-grad:${grads[i % grads.length]};cursor:pointer;"
      title="Click to view details for ${escHtml(name)}">
      <div class="mini-career-icon">${career.icon}</div>
      <div class="mini-career-name">${escHtml(name)}</div>
      <div class="mini-career-salary">${career.avgSalary} / yr</div>
      <div class="mini-career-growth">📈 ${career.jobGrowth} growth</div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════════════
// RESUME GUIDANCE
// ══════════════════════════════════════════════════════════════
function renderResumeGuidance() {
  const container = document.getElementById('resumeView');
  if (!container || container.children.length > 0) return;

  const tips = [
    { icon:'🎯', title:'Tailor Your Resume to Each Job',     body:"Match keywords from the job description — ATS systems scan for exact matches. A generic resume won't cut it." },
    { icon:'📊', title:'Quantify Your Achievements',          body:'Use numbers: "Improved API response time by 40%", not "improved performance". Numbers prove impact.' },
    { icon:'🔤', title:'Use Strong Action Verbs',             body:'Start bullet points with: Developed, Architected, Optimized, Led, Automated, Deployed. Avoid passive voice.' },
    { icon:'📐', title:'One Page (or Two Max)',                body:'For students and early-career professionals, one page is ideal. Every line must earn its place.' },
    { icon:'🛠️', title:'Focused Skills Section',              body:'Group your technical skills: Languages, Frameworks, Tools, Databases. Put the most relevant ones first.' },
    { icon:'🔗', title:'Link to Real Work',                   body:"Include GitHub, portfolio site, and LinkedIn. Recruiters want to see what you've actually built." },
    { icon:'📝', title:'Strong Professional Summary',         body:'2-3 sentences: who you are, your top skill, and what you\'re targeting. Customize per application.' },
    { icon:'🤖', title:'ATS Optimization',                    body:'Avoid tables, graphics, and non-standard headers. Use standard names: Experience, Education, Skills. PDF format.' },
  ];

  const templates = [
    { name:'Minimal Tech Resume',   desc:'Clean one-column layout perfect for software and data roles.',          tags:['Python','React','SQL'] },
    { name:'Two-Column Academic',   desc:'Perfect for recent graduates — highlights education and projects.',      tags:['Research','ML','Stats'] },
    { name:'AI/Data Science Focus', desc:'Emphasizes ML projects, model results, and Kaggle / GitHub links.',    tags:['TensorFlow','Pandas','LLMs'] },
  ];

  container.innerHTML = `
    <div style="margin-bottom:24px;">
      <span class="section-label">Career Tool</span>
      <h2 class="section-title" style="margin-top:10px;">Resume Guidance</h2>
      <p class="section-desc">Professional tips and templates to get interviews at top companies.</p>
    </div>

    <div style="margin-bottom:28px;">
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:17px;margin-bottom:16px;">✅ Key Resume Tips</h3>
      ${tips.map(t => `
        <div class="resume-tip-card">
          <div class="resume-tip-icon">${t.icon}</div>
          <div class="resume-tip-body">
            <h4>${escHtml(t.title)}</h4>
            <p>${escHtml(t.body)}</p>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="grid-2" style="margin-bottom:28px;">
      <div class="card">
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:14px;">📋 Resume Structure</h3>
        <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:10px;">
          ${['Contact Info → Summary → Skills → Experience → Projects → Education',
             'For limited experience, put Projects and Skills above Experience',
             'Never include photos, age, or marital status',
             'Keep formatting consistent — same font, sizes, spacing throughout'].map(i => `
            <li style="display:flex;gap:10px;font-size:13.5px;color:var(--text-secondary);">
              <span style="color:var(--accent-light);flex-shrink:0;">→</span>
              <span>${escHtml(i)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="card">
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:14px;">💼 For Tech Roles</h3>
        <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:10px;">
          ${['GitHub link is non-negotiable — show real code',
             'List projects: name, tech stack, key metric/result',
             'Include open source contributions',
             'Add certifications: Coursera, AWS, Google Cloud, Azure'].map(i => `
            <li style="display:flex;gap:10px;font-size:13.5px;color:var(--text-secondary);">
              <span style="color:var(--accent-light);flex-shrink:0;">→</span>
              <span>${escHtml(i)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>

    <div style="margin-bottom:28px;">
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:17px;margin-bottom:16px;">📄 Resume Templates</h3>
      <div class="grid-3">
        ${templates.map((tmpl, i) => `
          <div class="card" style="cursor:pointer;transition:all .2s;"
            onclick="downloadTemplate(${i})"
            onmouseenter="this.style.borderColor='var(--border-accent)'"
            onmouseleave="this.style.borderColor=''"
            id="template_${i}">
            <div style="font-size:28px;margin-bottom:12px;">📄</div>
            <h4 style="font-family:'Space Grotesk',sans-serif;font-size:15px;margin-bottom:8px;">${escHtml(tmpl.name)}</h4>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;line-height:1.6;">${escHtml(tmpl.desc)}</p>
            <div class="tech-tags">
              ${tmpl.tags.map(t => `<span class="tech-tag">${escHtml(t)}</span>`).join('')}
            </div>
            <button class="btn btn-outline btn-sm" style="margin-top:14px;width:100%;">
              Use Template →
            </button>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card" style="padding:28px;">
      <h3 style="font-family:'Space Grotesk',sans-serif;margin-bottom:16px;">🤖 AI Resume Analyzer</h3>
      <p style="color:var(--text-secondary);font-size:14px;line-height:1.7;margin-bottom:16px;">
        Paste your resume text to get instant feedback on structure, keywords, and ATS compatibility.
        Connect an AI API for advanced analysis.
      </p>
      <textarea
        style="width:100%;min-height:160px;padding:14px;background:var(--bg-surface);
          border:1px solid var(--border);border-radius:var(--radius);color:var(--text-primary);
          font-family:inherit;font-size:13px;resize:vertical;outline:none;line-height:1.6;"
        placeholder="Paste your resume text here to analyze it…"
        id="resumeTextarea"
        oninput="quickResumeCheck()"
      ></textarea>
      <div id="resumeQuickFeedback" style="margin-top:12px;display:none;"></div>
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="analyzeResume()" id="analyzeResumeBtn">
          🤖 Analyze with AI (API Required)
        </button>
        <button class="btn btn-secondary" onclick="quickResumeCheck(true)" id="quickCheckBtn">
          ✅ Quick Check
        </button>
        <button class="btn btn-secondary" onclick="clearResume()" id="clearResumeBtn">
          🗑️ Clear
        </button>
      </div>
      <div class="ai-placeholder-badge" style="margin-top:16px;">
        <span>🔌</span> Full AI Analysis — Connect your API key to enable
      </div>
    </div>
  `;
}

function downloadTemplate(i) {
  showToast('Template preview coming soon! AI integration will generate custom PDFs. 📄', '📝', 4000);
}

function quickResumeCheck(force = false) {
  const ta  = document.getElementById('resumeTextarea');
  const fb  = document.getElementById('resumeQuickFeedback');
  if (!ta || !fb) return;

  const text = ta.value.trim();
  if (!text && !force) { fb.style.display = 'none'; return; }
  if (!text) { showToast('Please paste your resume text first.', '⚠️'); return; }

  const checks = [
    { label: 'Has contact info (email)',   pass: /[\w.]+@[\w.]+\.\w+/.test(text) },
    { label: 'Mentions GitHub / portfolio', pass: /github\.com|portfolio|linkedin\.com/i.test(text) },
    { label: 'Contains action verbs',       pass: /developed|built|designed|implemented|created|led|managed|optimized|deployed|automated/i.test(text) },
    { label: 'Has quantified results',      pass: /\d+%|\$[\d,.]+|\d+ (people|users|engineers|teams|months|years)/i.test(text) },
    { label: 'Lists technical skills',      pass: /python|javascript|sql|react|node|aws|docker|tensorflow|pytorch/i.test(text) },
    { label: 'Adequate length (150+ words)',pass: text.split(/\s+/).length >= 150 },
  ];

  const score = checks.filter(c => c.pass).length;

  fb.style.display = 'block';
  fb.innerHTML = `
    <div style="padding:16px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:12px;">
      <div style="font-weight:700;font-size:15px;margin-bottom:12px;">
        Quick Resume Check: <span style="color:${score>=5?'var(--success)':score>=3?'var(--warning)':'var(--danger)'}">
          ${score}/${checks.length} passed
        </span>
      </div>
      ${checks.map(c => `
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;
          color:${c.pass?'var(--success)':'var(--danger)'};margin-bottom:6px;">
          ${c.pass ? '✅' : '❌'} ${escHtml(c.label)}
        </div>
      `).join('')}
    </div>
  `;
}

function analyzeResume() {
  const ta = document.getElementById('resumeTextarea');
  if (!ta || !ta.value.trim()) {
    showToast('Please paste your resume text first.', '⚠️');
    return;
  }
  showToast('Connect an AI API key to unlock full resume analysis. Use Quick Check for now! 🔌', '🤖', 4500);
}

function clearResume() {
  const ta = document.getElementById('resumeTextarea');
  const fb = document.getElementById('resumeQuickFeedback');
  if (ta) ta.value = '';
  if (fb) { fb.style.display = 'none'; fb.innerHTML = ''; }
}

// ══════════════════════════════════════════════════════════════
// COMPATIBILITY SHIMS  (keep old onclick handlers working)
// ══════════════════════════════════════════════════════════════
function scrollToProfile() { showView('profile'); }
function showSignup()      { openAuthModal(); showSignupPanel(); }
function showLogin()       { openAuthModal(); showLoginPanel(); }

// ══════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════
function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizeId(str) {
  return String(str).replace(/[^a-zA-Z0-9_]/g, '_');
}

// ══════════════════════════════════════════════════════════════
// CSS INJECTED FOR CAREER DETAIL PANEL + SHAKE ANIMATION
// (keeps styles co-located with the JS that uses them)
// ══════════════════════════════════════════════════════════════
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Career Detail Panel */
    .career-detail-panel { position:fixed;inset:0;z-index:500;display:flex;align-items:flex-end; }
    @media(min-width:640px){ .career-detail-panel { align-items:center;justify-content:flex-end; } }
    .career-detail-overlay { position:absolute;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px); }
    .career-detail-box {
      position:relative;z-index:1;width:100%;max-width:680px;max-height:92vh;
      background:var(--bg-card);border-radius:var(--radius-xl) var(--radius-xl) 0 0;
      overflow-y:auto;animation:detailSlideUp .3s cubic-bezier(.34,1.56,.64,1);
      box-shadow:var(--shadow-lg),-4px 0 40px rgba(124,58,237,.15);
    }
    @media(min-width:640px){
      .career-detail-box {
        height:92vh;border-radius:var(--radius-xl) 0 0 var(--radius-xl);
        animation:detailSlideRight .3s cubic-bezier(.34,1.56,.64,1);
      }
    }
    .career-detail-panel.closing .career-detail-box { animation:detailSlideDown .25s ease forwards; }
    @keyframes detailSlideUp   { from{transform:translateY(100%)} to{transform:none} }
    @keyframes detailSlideRight{ from{transform:translateX(100%)} to{transform:none} }
    @keyframes detailSlideDown { to{transform:translateY(100%)} }
    .career-detail-header {
      padding:32px;position:relative;border-radius:var(--radius-xl) var(--radius-xl) 0 0;
    }
    @media(min-width:640px){
      .career-detail-header { border-radius:var(--radius-xl) 0 0 0; }
    }
    .career-detail-close {
      position:absolute;top:16px;right:16px;
      width:32px;height:32px;border-radius:50%;
      background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);
      color:white;font-size:14px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      transition:all .2s;font-family:inherit;
    }
    .career-detail-close:hover { background:rgba(255,255,255,.3); }
    .career-detail-hero { color:white; }
    .career-detail-title { font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:800;margin-bottom:10px; }
    .career-detail-badges { display:flex;flex-wrap:wrap;gap:8px;margin-top:16px; }
    .det-badge {
      padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;
      background:rgba(255,255,255,.18);color:white;border:1px solid rgba(255,255,255,.25);
    }
    .career-detail-body { padding:28px; }
    .det-section { margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border); }
    .det-section:last-of-type { border-bottom:none; }
    .det-section-title { font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700;margin-bottom:16px; }
    /* Shake animation for form fields */
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-5px)}
      80%{transform:translateX(5px)}
    }
    .shake-field { animation:shake .4s ease; }
  `;
  document.head.appendChild(style);
})();

// ══════════════════════════════════════════════════════════════
// INIT  (runs on DOM ready)
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // 1. Restore theme preference
  restoreTheme();

  // 2. Load skill chips into profile form
  loadSkills();

  // 3. Render static/home content
  renderHomeCategoryGrid();

  // 4. Render views that pre-render (no analysis required)
  renderResumeGuidance();
  renderSkillAssessment();
  renderCareerCategories();
  initCareerSearch();

  // 5. Restore user session from localStorage
  restoreSession();

  // 6. Close auth modal when clicking backdrop
  document.getElementById('authModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeAuthModal();
  });

  // 7. Keyboard: ESC closes career detail panel or modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('careerDetailPanel')) { hideCareerDetail(); return; }
      closeAuthModal();
    }
  });
});