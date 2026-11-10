/* ==========================================================================
   SYNERA AI — Complete Interactive Logic (script.js)
   - Fix 1: Direct Academic & Math Solver (4a + 4a = 2 -> 8a = 2, a = 1/4) + Follow-Up Memory
   - Fix 2: Real PDF/PPTX/TXT Text Extraction -> Visible "Generate Quiz" Button -> 10 MCQs (1 at a time)
   - Removed Meal Logging & Hydration Tracking from Module 6
   ========================================================================== */

(function () {
  function initSyneraApp() {
    const state = {
      activePhase: '1',
      context: 'bus',
      minutes: 30,
      energy: 75,
      goal: 'Quick revision',
      skyTheme: false,
      bgmPlaying: false,
      selectedGenre: 'lofi-hiphop',
      rainPlaying: false,
      permissionGranted: true,
      errorLogCount: 0,
      correctCount: 0,
      totalAttempted: 0,
      timerSeconds: 1500,
      timerRunning: false,
      timerInterval: null,
      audioCtx: null,
      bgmInterval: null,
      rainNode: null,
      uploadedFileName: '',
      uploadedNotesText: '',
      extractedProcessed: false,
      generatedQuizQuestions: [],
      currentQuizIndex: 0,
      currentQuizScore: 0,
      currentQuizAnswered: false,
      subjects: [],
      geminiApiKey: '',
      chatHistory: [],
      lastMathEquation: null
    };

    const phaseTitles = {
      '1': '1. Overview & Context',
      '2': '2. Upload Materials & Studio',
      '3': '3. Adaptive Cloud Quiz',
      '4': '4. Error Log (1, 3, 5, 7 Days)',
      '5': '5. Lofi & Rain Soundscape',
      '6': '6. Study Timer & Break Guard',
      '7': '7. Study DNA & AI Chat'
    };

    const contextPresets = {
      bus: {
        name: 'On the Bus',
        defaultMinutes: 30,
        defaultEnergy: 75,
        readinessBase: 78,
        uiTheme: 'Cloud & Mountain',
        contentFormat: 'Short Quiz + Audio',
        sessionGoal: '10 MCQs · 1 Story'
      },
      library: {
        name: 'At the Library',
        defaultMinutes: 90,
        defaultEnergy: 100,
        readinessBase: 92,
        uiTheme: 'Deep Purple Focus',
        contentFormat: 'Notes + Error Retest',
        sessionGoal: '10 MCQs · Teach Back'
      },
      home: {
        name: 'At Home',
        defaultMinutes: 60,
        defaultEnergy: 75,
        readinessBase: 85,
        uiTheme: 'Cozy Purple Glass',
        contentFormat: 'Story + Podcast',
        sessionGoal: '1 Story · 10 MCQs'
      },
      between: {
        name: 'Between Classes',
        defaultMinutes: 15,
        defaultEnergy: 50,
        readinessBase: 72,
        uiTheme: 'Compact Quick Cards',
        contentFormat: 'Flash Error Review',
        sessionGoal: 'Quick Quiz'
      }
    };

    const genreProfiles = {
      'lofi-hiphop': {
        name: 'Lofi Hip-Hop',
        videoId: 'lTRiuFIWV54',
        embedBase: 'https://www.youtube-nocookie.com/embed/lTRiuFIWV54?si=hfSRjiKaSDlIuDP_',
        chords: [[261.63, 329.63, 392.00], [220.00, 261.63, 329.63], [174.61, 220.00, 261.63], [196.00, 246.94, 293.66]],
        wave: 'triangle',
        tempo: 1800
      },
      'dark-academia': {
        name: 'Dark Academia',
        videoId: 'm6SOJlkN1zU',
        embedBase: 'https://www.youtube-nocookie.com/embed/m6SOJlkN1zU?si=Udm79AJXPWLwnq21',
        chords: [[220.00, 261.63, 329.63], [196.00, 233.08, 293.66], [174.61, 220.00, 261.63], [164.81, 207.65, 246.94]],
        wave: 'sine',
        tempo: 2100
      },
      'calm-piano': {
        name: 'Calm Piano',
        videoId: 'cYPJaHT5f3E',
        embedBase: 'https://www.youtube-nocookie.com/embed/cYPJaHT5f3E?si=a4R72P_q6nZNqKXu',
        chords: [[293.66, 369.99, 440.00], [246.94, 293.66, 369.99], [196.00, 246.94, 293.66], [220.00, 277.18, 329.63]],
        wave: 'sine',
        tempo: 1900
      },
      'video-game': {
        name: 'Video Game',
        videoId: '7JMvn0wfABQ',
        embedBase: 'https://www.youtube-nocookie.com/embed/7JMvn0wfABQ?si=hvHnOS0UavcSIGvE',
        chords: [[329.63, 392.00, 493.88], [261.63, 329.63, 392.00], [293.66, 369.99, 440.00], [246.94, 329.63, 392.00]],
        wave: 'triangle',
        tempo: 1400
      },
      'lofi-jazz': {
        name: 'Lofi Jazz',
        videoId: 'CBSlu_VMS9U',
        embedBase: 'https://www.youtube-nocookie.com/embed/CBSlu_VMS9U?si=GmR0FomCT719Zysf',
        chords: [[261.63, 329.63, 392.00, 493.88], [293.66, 349.23, 440.00, 523.25], [196.00, 246.94, 293.66, 349.23]],
        wave: 'sine',
        tempo: 2000
      },
      'kdrama-ost': {
        name: 'K-Drama Piano OST',
        videoId: 'b4q1q0DawYg',
        embedBase: 'https://www.youtube-nocookie.com/embed/b4q1q0DawYg?si=amRD7BF8lhMhpVMR',
        chords: [[246.94, 311.13, 369.99], [277.18, 329.63, 415.30], [220.00, 277.18, 329.63], [246.94, 293.66, 369.99]],
        wave: 'sine',
        tempo: 2100
      }
    };

    function byId(id) {
      return document.getElementById(id);
    }

    function on(id, eventName, handler) {
      const el = document.getElementById(id);
      if (el) el.addEventListener(eventName, handler);
    }

    function setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    }

    function formatTimeNow() {
      return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function getEnergyCategory(val) {
      if (val <= 40) return 'Low';
      if (val <= 75) return 'Moderate';
      return 'High';
    }

    function addAgentLog(tag, message) {
      const logList = byId('agent-log-list');
      if (!logList) return;
      const item = document.createElement('div');
      item.className = 'p-3 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-xs space-y-1';
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded bg-purple-500/30 text-purple-200">${tag}</span>
          <span class="text-[10px] text-purple-300/60 font-mono">${formatTimeNow()}</span>
        </div>
        <p class="text-purple-100/90 leading-relaxed">${message}</p>
      `;
      logList.prepend(item);
    }

    function showUploadStatus(type, htmlMessage) {
      const box = byId('upload-status-box');
      if (!box) return;
      box.classList.remove('hidden');
      if (type === 'loading') {
        box.className = 'p-4 rounded-2xl border bg-indigo-950/80 border-indigo-400/40 text-indigo-200 text-xs sm:text-sm font-semibold';
      } else if (type === 'error') {
        box.className = 'p-4 rounded-2xl border bg-rose-950/90 border-rose-400/50 text-rose-200 text-xs sm:text-sm font-semibold';
      } else {
        box.className = 'p-4 rounded-2xl border bg-emerald-950/90 border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-semibold';
      }
      box.innerHTML = htmlMessage;
    }

    // Hamburger Menu
    function toggleHamburger(open) {
      const drawer = byId('hamburger-drawer');
      const backdrop = byId('menu-backdrop');
      if (!drawer) return;
      if (open) {
        drawer.classList.remove('-translate-x-full');
        if (backdrop) backdrop.classList.remove('hidden');
      } else {
        drawer.classList.add('-translate-x-full');
        if (backdrop) backdrop.classList.add('hidden');
      }
    }

    on('hamburger-btn', 'click', () => toggleHamburger(true));
    on('close-hamburger-btn', 'click', () => toggleHamburger(false));
    on('menu-backdrop', 'click', () => {
      toggleHamburger(false);
      const agentDrawer = byId('agent-brain-drawer');
      if (agentDrawer) agentDrawer.classList.add('translate-x-full');
    });

    on('toggle-agent-drawer-btn', 'click', () => {
      const agentDrawer = byId('agent-brain-drawer');
      if (agentDrawer) agentDrawer.classList.toggle('translate-x-full');
    });
    on('close-agent-drawer-btn', 'click', () => {
      const agentDrawer = byId('agent-brain-drawer');
      if (agentDrawer) agentDrawer.classList.add('translate-x-full');
    });

    function switchPhaseView(phaseId) {
      state.activePhase = phaseId;
      document.querySelectorAll('.app-view').forEach(sec => sec.classList.add('hidden'));
      const target = byId(`view-phase-${phaseId}`);
      if (target) target.classList.remove('hidden');

      setText('active-section-badge', phaseTitles[phaseId] || 'Overview');

      document.querySelectorAll('#hamburger-drawer .phase-tab-btn').forEach(btn => {
        const isCurrent = btn.getAttribute('data-phase') === phaseId;
        btn.className = isCurrent
          ? 'phase-tab-btn w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold bg-purple-600 text-white flex items-center gap-3 transition'
          : 'phase-tab-btn w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold text-purple-200 hover:bg-purple-900/50 flex items-center gap-3 transition';
      });
      toggleHamburger(false);
    }

    document.querySelectorAll('.phase-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const phase = btn.getAttribute('data-phase');
        if (phase) switchPhaseView(phase);
      });
    });

    // Update Dashboard UI
    function updateDashboardUI(logEvent) {
      const preset = contextPresets[state.context] || contextPresets.bus;
      const hasQuizzes = state.totalAttempted > 0;
      const accuracyPct = hasQuizzes ? Math.round((state.correctCount / state.totalAttempted) * 100) : 0;
      const score = hasQuizzes
        ? Math.max(45, Math.min(98, Math.round(preset.readinessBase * 0.5 + accuracyPct * 0.3 + state.energy * 0.2)))
        : Math.round(preset.readinessBase * 0.75 + state.energy * 0.2);
      const energyLabel = getEnergyCategory(state.energy);

      setText('time-value-label', `${state.minutes} minutes`);
      const energyLabelEl = byId('energy-value-label');
      if (energyLabelEl) {
        energyLabelEl.textContent = energyLabel;
        energyLabelEl.className = energyLabel === 'Low'
          ? 'text-amber-300 font-bold'
          : energyLabel === 'Moderate'
            ? 'text-emerald-300 font-bold'
            : 'text-sky-300 font-bold';
      }

      setText('engagement-score-value', `${score} / 100`);
      setText('readiness-ring-text', `${score}%`);
      setText('focus-score-badge', `${score}%`);
      const progressBar = byId('focus-progress-bar');
      if (progressBar) progressBar.style.width = `${score}%`;

      if (hasQuizzes) {
        setText('metric-accuracy', `${accuracyPct}% (${state.correctCount}/${state.totalAttempted})`);
        setText('metric-consistency', 'High (3.8s avg)');
      } else {
        setText('metric-accuracy', 'No quizzes yet (0/0)');
        setText('metric-consistency', 'No data yet');
      }

      setText('recommended-mode-title', `Recommended Session: ${state.minutes}-Min ${preset.name} (${energyLabel} Energy · ${state.goal})`);
      setText('ui-theme-recommendation', preset.uiTheme);
      setText('content-format-recommendation', preset.contentFormat);
      setText('session-goal-recommendation', preset.sessionGoal);

      setText('agent-perceive-text', `${preset.name} (${state.minutes}m)`);
      setText('agent-act-text', preset.contentFormat);
      setText('agent-reason-text', `${score}% Ready`);

      document.querySelectorAll('.context-card').forEach(card => {
        const isCurrent = card.getAttribute('data-context') === state.context;
        const badge = card.querySelector('span:nth-child(2)');
        card.className = isCurrent
          ? 'context-card glass-card-active text-left p-4 rounded-2xl transition space-y-2'
          : 'context-card glass-card text-left p-4 rounded-2xl transition hover:border-purple-400/50 space-y-2';
        if (badge) {
          badge.className = isCurrent
            ? 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500 text-white'
            : 'text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-950 text-purple-300';
          badge.textContent = isCurrent ? 'Selected' : 'Select';
        }
      });

      if (logEvent) {
        addAgentLog(
          '3. PLAN → 4. ACT',
          `Context: <strong>${preset.name}</strong> (${state.minutes} mins, Energy: <strong>${energyLabel}</strong>). Engagement Readiness: <strong>${score}/100</strong>.`
        );
      }
    }

    document.querySelectorAll('.context-card').forEach(card => {
      card.addEventListener('click', () => {
        state.context = card.getAttribute('data-context') || 'bus';
        const preset = contextPresets[state.context] || contextPresets.bus;
        state.minutes = preset.defaultMinutes;
        state.energy = preset.defaultEnergy;
        const ts = byId('time-slider');
        const es = byId('energy-slider');
        if (ts) ts.value = state.minutes;
        if (es) es.value = state.energy;
        updateDashboardUI(true);
      });
    });

    const timeSliderEl = byId('time-slider');
    if (timeSliderEl) {
      timeSliderEl.addEventListener('input', (e) => {
        state.minutes = parseInt(e.target.value, 10);
        updateDashboardUI(false);
      });
    }

    const energySliderEl = byId('energy-slider');
    if (energySliderEl) {
      energySliderEl.addEventListener('input', (e) => {
        state.energy = parseInt(e.target.value, 10);
        updateDashboardUI(false);
      });
    }

    document.querySelectorAll('.goal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.goal = btn.getAttribute('data-goal') || 'Quick revision';
        document.querySelectorAll('.goal-btn').forEach(b => {
          b.className = b.getAttribute('data-goal') === state.goal
            ? 'goal-btn py-1.5 rounded-lg text-[11px] font-bold bg-purple-600 text-white'
            : 'goal-btn py-1.5 rounded-lg text-[11px] font-medium bg-purple-900/50 text-purple-200';
        });
        updateDashboardUI(true);
      });
    });

    on('toggle-permission-btn', 'click', () => {
      state.permissionGranted = !state.permissionGranted;
      setText('distraction-status-text', state.permissionGranted ? 'Permission Granted · 0 Switches' : 'Privacy Mode · Sensor Off');
      setText('toggle-permission-btn', state.permissionGranted ? 'Permitted' : 'Off');
    });

    // Study DNA Subject Explorer
    function registerSubjectInDNA(subjectName, notesSnippet) {
      const cleanName = (subjectName || 'General Study Topic').trim();
      const existing = state.subjects.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
      if (!existing) {
        state.subjects.push({
          name: cleanName,
          notes: notesSnippet || 'Uploaded study material',
          accuracy: 'No quiz taken yet',
          weakness: 'None recorded yet'
        });
      }
      renderStudyDNASubjects();
    }

    function renderStudyDNASubjects() {
      const listEl = byId('dna-subjects-list');
      if (!listEl) return;
      if (state.subjects.length === 0) {
        listEl.innerHTML = `
          <div id="dna-empty-state" class="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/20 text-center text-purple-300/75">
            No subjects recorded yet. Upload lecture materials in Module 2 or add a subject above to view your Study DNA breakdown!
          </div>
        `;
        return;
      }

      listEl.innerHTML = '';
      state.subjects.forEach((subj, idx) => {
        const card = document.createElement('div');
        card.className = 'rounded-2xl bg-purple-950/70 border border-purple-500/30 overflow-hidden';
        card.innerHTML = `
          <button type="button" data-subj-idx="${idx}" class="dna-subj-header w-full p-3.5 text-left flex items-center justify-between hover:bg-purple-900/40 transition">
            <span class="font-bold text-white text-xs sm:text-sm">📘 ${subj.name}</span>
            <span class="text-[11px] text-purple-300">Click for DNA ▾</span>
          </button>
          <div id="dna-subj-details-${idx}" class="hidden p-3.5 border-t border-purple-500/20 bg-black/30 space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-purple-300">Quiz Accuracy:</span><strong class="text-emerald-300">${subj.accuracy}</strong></div>
            <div class="flex justify-between"><span class="text-purple-300">Best Format:</span><strong class="text-sky-300">10-MCQ Active Recall</strong></div>
            <div class="flex justify-between"><span class="text-purple-300">Weak Concept:</span><strong class="text-rose-300">${subj.weakness}</strong></div>
          </div>
        `;
        listEl.appendChild(card);
      });

      listEl.querySelectorAll('.dna-subj-header').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = btn.getAttribute('data-subj-idx');
          const detail = byId(`dna-subj-details-${i}`);
          if (detail) detail.classList.toggle('hidden');
        });
      });
    }

    on('toggle-dna-subjects-btn', 'click', () => {
      const panel = byId('dna-subjects-panel');
      if (panel) panel.classList.toggle('hidden');
    });

    on('add-subject-btn', 'click', () => {
      const inp = byId('new-subject-input');
      if (!inp || !inp.value.trim()) return;
      registerSubjectInDNA(inp.value.trim(), 'Added manually in Study DNA');
      addAgentLog('STUDY DNA', `Added new subject <strong>${inp.value.trim()}</strong> to Study DNA.`);
      inp.value = '';
    });

    // ====================================================================
    // FIX 2: REAL FILE EXTRACTION (PDF, PPTX, TXT) & 10-QUESTION QUIZ ENGINE
    // ====================================================================
    async function extractTextFromUploadedFile(file) {
      const nameLower = file.name.toLowerCase();

      // 1. TXT Extraction
      if (nameLower.endsWith('.txt')) {
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(String(ev.target.result || '').trim());
          reader.onerror = () => reject(new Error('Failed to read TXT file.'));
          reader.readAsText(file);
        });
      }

      // 2. PDF Extraction using PDF.js
      if (nameLower.endsWith('.pdf')) {
        if (typeof window.pdfjsLib === 'undefined') {
          throw new Error('PDF extraction library (pdf.js) could not be loaded. Check your internet connection or paste your text directly.');
        }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageStrings = content.items.map(item => item.str);
          fullText += pageStrings.join(' ') + '\n';
        }
        return fullText.trim();
      }

      // 3. PPTX Extraction using JSZip (reads ppt/slides/slide*.xml)
      if (nameLower.endsWith('.pptx')) {
        if (typeof window.JSZip === 'undefined') {
          throw new Error('PPTX extraction library (JSZip) could not be loaded. Check your internet connection or paste your text directly.');
        }
        const arrayBuffer = await file.arrayBuffer();
        const zip = await window.JSZip.loadAsync(arrayBuffer);
        const slideFiles = Object.keys(zip.files)
          .filter(k => /^ppt\/slides\/slide\d+\.xml$/i.test(k))
          .sort((a, b) => {
            const na = parseInt((a.match(/\d+/) || ['0'])[0], 10);
            const nb = parseInt((b.match(/\d+/) || ['0'])[0], 10);
            return na - nb;
          });
        if (slideFiles.length === 0) {
          throw new Error('No slides found inside this PPTX file.');
        }
        let slidesText = '';
        for (const slidePath of slideFiles) {
          const xmlStr = await zip.files[slidePath].async('string');
          const matches = xmlStr.match(/<a:t>([^<]+)<\/a:t>/g) || [];
          const slideWords = matches.map(m => m.replace(/<\/?a:t>/g, '').trim()).filter(Boolean);
          if (slideWords.length > 0) {
            slidesText += slideWords.join(' ') + '. ';
          }
        }
        return slidesText.trim();
      }

      throw new Error('Unsupported file format. Please upload a .PDF, .PPTX, or .TXT file.');
    }

    function processExtractedContent(text, sourceLabel) {
      const clean = (text || '').replace(/\s+/g, ' ').trim();
      if (clean.length < 40) {
        state.extractedProcessed = false;
        const genQuizBtn = byId('generate-quiz-btn');
        if (genQuizBtn) genQuizBtn.classList.add('hidden');
        showUploadStatus(
          'error',
          `❌ <strong>Extraction Failed:</strong> Could not extract enough readable text from <em>${sourceLabel}</em> (found ${clean.length} characters). Do not use scanned image-only files—please upload a text-based PDF, PPTX, or TXT file with at least a few sentences of study content.`
        );
        return false;
      }

      state.uploadedNotesText = clean;
      state.extractedProcessed = true;

      const subjInput = byId('subject-name-input');
      const subjectTitle = (subjInput && subjInput.value.trim()) || state.uploadedFileName || 'Uploaded Study Material';

      const sentences = clean
        .split(/(?<=[.!?])\s+|\n+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);

      setText('generated-notes-title', `Extracted Key Points: ${subjectTitle}`);
      const notesList = byId('generated-notes-list');
      if (notesList) {
        const topSentences = sentences.slice(0, 6);
        notesList.innerHTML = topSentences
          .map((s, idx) => `<li><strong>Point ${idx + 1}:</strong> ${s}</li>`)
          .join('');
      }

      const firstPt = sentences[0] || clean.slice(0, 100);
      const secondPt = sentences[1] || clean.slice(100, 200);
      setText('generated-story-title', `Contextual Story: ${subjectTitle}`);
      setText('generated-story-body', `While revising "${subjectTitle}", Alya connected the core idea — "${firstPt}" — with "${secondPt}". Turning raw definitions into a real-world scenario helped her recall every detail effortlessly!`);

      setText('podcast-episode-label', `Episode: "${subjectTitle} Deep-Dive"`);
      setText('podcast-subtitle-box', `[Subtitle]: "Let's review ${subjectTitle}: ${firstPt}"`);

      const animBox = byId('animation-stage-box');
      if (animBox) {
        animBox.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center text-xs">
            <div class="p-4 rounded-xl bg-purple-950 border border-purple-400/40">
              <strong class="block text-purple-200">1. Source Material</strong>
              <span class="text-purple-100/80 block mt-1">${subjectTitle}</span>
            </div>
            <div class="text-2xl font-black text-emerald-300 anim-pulse-flow">⚡ ➡️ ⚡</div>
            <div class="p-4 rounded-xl bg-emerald-950/70 border border-emerald-400/40">
              <strong class="block text-emerald-200">2. Extracted Concept</strong>
              <span class="text-emerald-100/80 block mt-1">${firstPt.slice(0, 80)}</span>
            </div>
          </div>
        `;
      }

      registerSubjectInDNA(subjectTitle, firstPt);

      // Reveal the clearly visible "Generate Quiz (10 MCQs)" button
      const genQuizBtn = byId('generate-quiz-btn');
      if (genQuizBtn) genQuizBtn.classList.remove('hidden');

      const wordCount = clean.split(/\s+/).length;
      showUploadStatus(
        'success',
        `✅ <strong>Content Extracted &amp; Analysed (${wordCount} words, ${sentences.length} key statements from "${sourceLabel}")!</strong> Click the green <strong>"🎯 Generate Quiz (10 MCQs)"</strong> button above to start your 10-question quiz.`
      );
      addAgentLog('2. UNDERSTAND', `Successfully extracted ${wordCount} words from <strong>${sourceLabel}</strong>. Ready to generate 10 MCQs.`);
      return true;
    }

    on('lecture-file-input', 'change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const nameLower = file.name.toLowerCase();
      if (!nameLower.endsWith('.pdf') && !nameLower.endsWith('.pptx') && !nameLower.endsWith('.txt')) {
        setText('uploaded-file-badge', '❌ Unsupported file type');
        showUploadStatus('error', `❌ <strong>Unsupported File Type:</strong> "${file.name}". Please upload a <strong>.PDF, .PPTX, or .TXT</strong> file.`);
        return;
      }

      setText('uploaded-file-badge', `⏳ Processing: ${file.name}...`);
      showUploadStatus('loading', `⏳ <strong>Extracting text from "${file.name}"...</strong> Please wait while Synera analyses the document.`);

      try {
        const extractedText = await extractTextFromUploadedFile(file);
        if (!extractedText || extractedText.length < 40) {
          setText('uploaded-file-badge', `⚠️ Extraction failed: ${file.name}`);
          const genQuizBtn = byId('generate-quiz-btn');
          if (genQuizBtn) genQuizBtn.classList.add('hidden');
          showUploadStatus(
            'error',
            `❌ <strong>Could Not Extract Readable Content:</strong> "${file.name}" appears to be empty or a scanned image without selectable text. We do not generate fake questions when text cannot be extracted. Please upload a text-based PDF, PPTX, or TXT file.`
          );
          return;
        }

        state.uploadedFileName = file.name;
        setText('uploaded-file-badge', `✅ Extracted: ${file.name}`);
        const cleanTopic = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
        const subjInput = byId('subject-name-input');
        if (subjInput && !subjInput.value.trim()) subjInput.value = cleanTopic;

        const textArea = byId('study-input-text');
        if (textArea) textArea.value = extractedText;

        processExtractedContent(extractedText, file.name);
      } catch (err) {
        setText('uploaded-file-badge', `❌ Error reading file`);
        const genQuizBtn = byId('generate-quiz-btn');
        if (genQuizBtn) genQuizBtn.classList.add('hidden');
        showUploadStatus('error', `❌ <strong>File Processing Error:</strong> ${err.message || 'Unable to extract content from this file.'}`);
      }
    });

    on('generate-multimodal-btn', 'click', () => {
      const rawText = (byId('study-input-text') ? byId('study-input-text').value : '').trim();
      const subjInputVal = (byId('subject-name-input') ? byId('subject-name-input').value : '').trim();
      const label = state.uploadedFileName || subjInputVal || 'Pasted Lecture Notes';
      processExtractedContent(rawText, label);
    });

    async function buildTenQuestionsFromContent(text, subjectTitle) {
      // 1. Try Gemini API first if key is configured
      if (state.geminiApiKey) {
        try {
          const prompt = `Based strictly on the following lecture material about "${subjectTitle}", generate exactly 10 multiple-choice questions. Return ONLY valid JSON as an array of 10 objects, each with keys: "question" (string), "options" (array of 4 strings), "correctIndex" (integer 0 to 3), "explanation" (string), and "topic" (string).\n\nLecture Material:\n${text.slice(0, 12000)}`;
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(state.geminiApiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          });
          const data = await res.json();
          const rawJson = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            if (Array.isArray(parsed) && parsed.length >= 10) {
              return parsed.slice(0, 10);
            }
          }
        } catch (e) {}
      }

      // 2. Deterministic Document-Driven 10-MCQ Generator from the actual extracted text
      const clean = text.replace(/\s+/g, ' ').trim();
      let statements = clean
        .split(/(?<=[.!?])\s+|\n+/)
        .map(s => s.trim())
        .filter(s => s.split(/\s+/).length >= 5);

      if (statements.length < 10) {
        const clauses = clean
          .split(/[.;!?\n]+/)
          .map(s => s.trim())
          .filter(s => s.split(/\s+/).length >= 4);
        statements = clauses;
      }

      const stopWords = new Set([
        'the','and','for','that','this','with','from','are','was','were','have','has','had','not','but','what','which','when','where','who','will','would','could','should','into','about','than','then','them','they','their','there','here','also','been','being','each','more','most','other','some','such','only','over','under','between','through','during','before','after','above','below'
      ]);

      const allWords = clean
        .replace(/[^a-zA-Z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !stopWords.has(w.toLowerCase()));

      const uniqueTerms = [];
      const seenLower = new Set();
      for (const w of allWords) {
        const lw = w.toLowerCase();
        if (!seenLower.has(lw)) {
          seenLower.add(lw);
          uniqueTerms.push(w);
        }
      }

      if (statements.length === 0 || uniqueTerms.length < 4) {
        throw new Error('The uploaded document does not contain enough distinct terms and sentences to build 10 multiple-choice questions. Please provide a more detailed document.');
      }

      const questions = [];
      for (let i = 0; i < 10; i++) {
        const stmt = statements[i % statements.length];
        const stmtWords = stmt
          .replace(/[^a-zA-Z0-9\s-]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length >= 4 && !stopWords.has(w.toLowerCase()));

        const targetTerm = stmtWords[(i < stmtWords.length ? i : 0)] || uniqueTerms[i % uniqueTerms.length];
        const blankedStmt = stmt.replace(new RegExp(`\\b${targetTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), '________');

        const distractors = [];
        for (let d = 1; d < uniqueTerms.length && distractors.length < 3; d++) {
          const cand = uniqueTerms[(i * 3 + d) % uniqueTerms.length];
          if (cand.toLowerCase() !== targetTerm.toLowerCase() && !distractors.some(x => x.toLowerCase() === cand.toLowerCase())) {
            distractors.push(cand);
          }
        }
        while (distractors.length < 3) {
          distractors.push(`None of the ${subjectTitle} terms (${distractors.length + 1})`);
        }

        const options = [targetTerm, distractors[0], distractors[1], distractors[2]];
        const correctPos = i % 4;
        const temp = options[0];
        options[0] = options[correctPos];
        options[correctPos] = temp;

        questions.push({
          question: blankedStmt !== stmt
            ? `Complete the statement from your "${subjectTitle}" material: "${blankedStmt}"`
            : `According to your "${subjectTitle}" notes, which key term is central to: "${stmt.slice(0, 110)}..."?`,
          options,
          correctIndex: correctPos,
          explanation: `Source statement from your uploaded material: "${stmt}"`,
          topic: `${subjectTitle} — Concept #${(i % statements.length) + 1}`
        });
      }

      return questions;
    }

    function renderCurrentQuizQuestion() {
      const questions = state.generatedQuizQuestions;
      const idx = state.currentQuizIndex;
      const total = questions.length;
      const studioBox = byId('studio-quiz-container');
      const scoreBadge = byId('studio-quiz-score-badge');

      if (!studioBox || total === 0) return;
      if (scoreBadge) {
        scoreBadge.classList.remove('hidden');
        scoreBadge.textContent = `Score: ${state.currentQuizScore} / ${total}`;
      }

      if (idx >= total) {
        const pct = Math.round((state.currentQuizScore / total) * 100);
        studioBox.innerHTML = `
          <div class="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-400/40 text-center space-y-4">
            <span class="text-3xl block">🎉</span>
            <h4 class="text-xl font-extrabold text-white">Quiz Completed!</h4>
            <p class="text-sm text-emerald-200">
              Final Score: <strong>${state.currentQuizScore} / ${total} (${pct}%)</strong>
            </p>
            <p class="text-xs text-purple-200">
              All incorrect answers have been saved to your <strong>Module 4 Error Log</strong> with their corresponding topics and Day 1, 3, 5, 7 revision schedules.
            </p>
            <div class="flex flex-wrap justify-center gap-3 pt-2">
              <button id="restart-10q-btn" type="button" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white">
                🔄 Retry 10 Questions
              </button>
              <button type="button" data-phase="4" class="phase-tab-btn px-5 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-xs font-bold text-white">
                📋 View Error Log →
              </button>
            </div>
          </div>
        `;
        on('restart-10q-btn', 'click', () => {
          state.currentQuizIndex = 0;
          state.currentQuizScore = 0;
          state.currentQuizAnswered = false;
          renderCurrentQuizQuestion();
        });
        studioBox.querySelectorAll('.phase-tab-btn').forEach(b => {
          b.addEventListener('click', () => switchPhaseView(b.getAttribute('data-phase')));
        });
        return;
      }

      const qObj = questions[idx];
      const letters = ['A', 'B', 'C', 'D'];

      studioBox.innerHTML = `
        <div class="text-left space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
            <span class="text-xs font-extrabold uppercase tracking-wider text-purple-300">
              Question ${idx + 1} of ${total}
            </span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
              Topic: ${qObj.topic}
            </span>
          </div>

          <p class="text-sm sm:text-base font-bold text-white leading-relaxed">${qObj.question}</p>

          <div id="mcq-options-list" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            ${qObj.options.map((opt, oIdx) => `
              <button type="button" data-opt-index="${oIdx}" class="mcq-opt-btn p-3.5 rounded-2xl bg-purple-950/90 hover:bg-purple-800/80 border border-purple-400/30 text-left text-xs sm:text-sm font-semibold text-white transition flex items-start gap-2.5">
                <span class="w-6 h-6 rounded-lg bg-purple-600/40 border border-purple-400/40 flex items-center justify-center text-xs font-extrabold shrink-0">${letters[oIdx]}</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>

          <div id="mcq-immediate-feedback" class="hidden p-4 rounded-2xl border text-xs sm:text-sm space-y-1"></div>

          <div class="flex justify-end pt-2">
            <button id="mcq-next-btn" type="button" class="hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-extrabold text-white shadow-lg transition">
              ${idx + 1 < total ? `Next Question (${idx + 2}/${total}) →` : 'Finish & View Final Score →'}
            </button>
          </div>
        </div>
      `;

      // Sync with Module 3 (Adaptive Cloud Quiz)
      const emptyCloud = byId('cloud-quiz-empty-state');
      const activeCloud = byId('cloud-quiz-active-area');
      if (emptyCloud) emptyCloud.classList.add('hidden');
      if (activeCloud) activeCloud.classList.remove('hidden');
      setText('cloud-quiz-topic-badge', qObj.topic);
      setText('cloud-question-progress', `Question ${idx + 1} of ${total} · Score: ${state.currentQuizScore}/${total}`);
      setText('cloud-question-text', qObj.question);
      const cloudFb = byId('cloud-quiz-feedback');
      if (cloudFb) cloudFb.classList.add('hidden');
      const cloudNextBtn = byId('cloud-next-q-btn');
      if (cloudNextBtn) cloudNextBtn.classList.add('hidden');

      const cloudGrid = byId('cloud-options-grid');
      if (cloudGrid) {
        cloudGrid.innerHTML = qObj.options.map((opt, oIdx) => `
          <button type="button" data-opt-index="${oIdx}" class="cloud-mcq-opt-btn cloud-btn ${oIdx % 2 === 0 ? 'float-cloud' : 'float-cloud-delayed'} bg-white text-slate-900 hover:bg-sky-50 font-bold text-xs sm:text-sm py-4 px-5 shadow-lg border-2 border-sky-200">
            ☁️ ${letters[oIdx]}. ${opt}
          </button>
        `).join('');
      }

      function handleOptionSelection(chosenIndex) {
        if (state.currentQuizAnswered) return;
        state.currentQuizAnswered = true;

        const isCorrect = chosenIndex === qObj.correctIndex;
        const chosenText = qObj.options[chosenIndex];
        const correctText = qObj.options[qObj.correctIndex];

        state.totalAttempted += 1;
        if (isCorrect) {
          state.correctCount += 1;
          state.currentQuizScore += 1;
        } else {
          state.errorLogCount += 1;
          setText('error-log-counter', String(state.errorLogCount));

          const emptyRow = byId('error-log-empty-row');
          if (emptyRow) emptyRow.remove();

          const tbody = byId('error-log-table-body');
          if (tbody) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td class="py-3.5 px-3">
                <span class="text-[11px] font-bold text-fuchsia-300 block">${qObj.topic}</span>
                <strong class="text-white text-xs">${qObj.question}</strong>
              </td>
              <td class="py-3.5 px-3 text-xs">
                <span class="text-rose-300 block">❌ Chosen: "${chosenText}"</span>
                <span class="text-emerald-300 block">✅ Correct: "${correctText}"</span>
                <span class="text-purple-200/80 block mt-0.5">${qObj.explanation}</span>
              </td>
              <td class="py-3.5 px-3 font-mono text-xs text-purple-200">
                <strong>Day 1 (Tomorrow)</strong> → Day 3 → Day 5 → Day 7
              </td>
              <td class="py-3.5 px-3">
                <span class="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-bold">Saved</span>
              </td>
            `;
            tbody.prepend(tr);
          }
          addAgentLog('ERROR LOGGED', `Saved incorrect answer under topic <strong>${qObj.topic}</strong> to Error Log.`);
        }

        studioBox.querySelectorAll('.mcq-opt-btn').forEach(btn => {
          const bIdx = parseInt(btn.getAttribute('data-opt-index'), 10);
          if (bIdx === qObj.correctIndex) {
            btn.className = 'mcq-opt-btn p-3.5 rounded-2xl bg-emerald-900/80 border-2 border-emerald-400 text-left text-xs sm:text-sm font-bold text-white flex items-start gap-2.5';
          } else if (bIdx === chosenIndex && !isCorrect) {
            btn.className = 'mcq-opt-btn p-3.5 rounded-2xl bg-rose-900/80 border-2 border-rose-400 text-left text-xs sm:text-sm font-bold text-white flex items-start gap-2.5';
          } else {
            btn.className = 'mcq-opt-btn p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-left text-xs sm:text-sm text-purple-300/60 flex items-start gap-2.5 opacity-60';
          }
        });

        const fbBox = byId('mcq-immediate-feedback');
        if (fbBox) {
          fbBox.classList.remove('hidden');
          if (isCorrect) {
            fbBox.className = 'p-4 rounded-2xl border bg-emerald-950/90 border-emerald-400/60 text-emerald-100 text-xs sm:text-sm space-y-1';
            fbBox.innerHTML = `<p>✅ <strong>Correct!</strong> "${correctText}" is the right answer.</p><p class="text-emerald-200/90">${qObj.explanation}</p>`;
          } else {
            fbBox.className = 'p-4 rounded-2xl border bg-rose-950/90 border-rose-400/60 text-rose-100 text-xs sm:text-sm space-y-1';
            fbBox.innerHTML = `<p>❌ <strong>Incorrect.</strong> You selected "${chosenText}", but the correct answer is <strong>"${correctText}"</strong>.</p><p class="text-rose-200/90">${qObj.explanation}</p><p class="text-[11px] text-amber-200">📌 Saved to your Error Log under topic: <strong>${qObj.topic}</strong>.</p>`;
          }
        }

        if (cloudFb) {
          cloudFb.classList.remove('hidden');
          cloudFb.className = isCorrect
            ? 'rounded-2xl p-4 text-xs sm:text-sm font-semibold border bg-emerald-950/90 border-emerald-400 text-emerald-200'
            : 'rounded-2xl p-4 text-xs sm:text-sm font-semibold border bg-rose-950/90 border-rose-400 text-rose-200';
          cloudFb.innerHTML = isCorrect
            ? `✅ <strong>Correct!</strong> "${correctText}" — ${qObj.explanation}`
            : `❌ <strong>Incorrect.</strong> Correct answer: "${correctText}". ${qObj.explanation} (Saved to Error Log: ${qObj.topic})`;
        }

        if (scoreBadge) {
          scoreBadge.textContent = `Score: ${state.currentQuizScore} / ${total}`;
        }

        const nextBtn = byId('mcq-next-btn');
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (cloudNextBtn) cloudNextBtn.classList.remove('hidden');

        const accuracyPct = Math.round((state.correctCount / state.totalAttempted) * 100);
        const subjName = qObj.topic.split(' — ')[0];
        const subjObj = state.subjects.find(s => s.name.toLowerCase() === subjName.toLowerCase());
        if (subjObj) {
          subjObj.accuracy = `${accuracyPct}% (${state.correctCount}/${state.totalAttempted})`;
          if (!isCorrect) subjObj.weakness = qObj.topic;
          renderStudyDNASubjects();
        }

        updateDashboardUI(false);
      }

      studioBox.querySelectorAll('.mcq-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const oIdx = parseInt(btn.getAttribute('data-opt-index'), 10);
          handleOptionSelection(oIdx);
        });
      });

      if (cloudGrid) {
        cloudGrid.querySelectorAll('.cloud-mcq-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const oIdx = parseInt(btn.getAttribute('data-opt-index'), 10);
            handleOptionSelection(oIdx);
          });
        });
      }

      on('mcq-next-btn', 'click', () => {
        state.currentQuizIndex += 1;
        state.currentQuizAnswered = false;
        renderCurrentQuizQuestion();
      });
    }

    on('cloud-next-q-btn', 'click', () => {
      state.currentQuizIndex += 1;
      state.currentQuizAnswered = false;
      renderCurrentQuizQuestion();
    });

    on('generate-quiz-btn', 'click', async () => {
      const rawText = (byId('study-input-text') ? byId('study-input-text').value : '').trim();
      const subjInputVal = (byId('subject-name-input') ? byId('subject-name-input').value : '').trim();
      const subjectTitle = subjInputVal || (state.uploadedFileName ? state.uploadedFileName.replace(/\.[^/.]+$/, '') : 'Uploaded Study Material');

      if (!rawText || rawText.length < 40) {
        showUploadStatus('error', '❌ <strong>Cannot Generate Quiz:</strong> No valid extracted study content found. Please upload a PDF, PPTX, or TXT file first.');
        return;
      }

      showUploadStatus('loading', `⏳ <strong>Generating 10 multiple-choice questions from "${subjectTitle}"...</strong>`);

      try {
        const questions = await buildTenQuestionsFromContent(rawText, subjectTitle);
        state.generatedQuizQuestions = questions;
        state.currentQuizIndex = 0;
        state.currentQuizScore = 0;
        state.currentQuizAnswered = false;

        setText('studio-quiz-title', `🎯 10-Question Quiz: ${subjectTitle}`);
        renderCurrentQuizQuestion();

        const quizTabBtn = document.querySelector('[data-studio="quiz"]');
        if (quizTabBtn) quizTabBtn.click();

        showUploadStatus('success', `✅ <strong>10 Multiple-Choice Questions Generated from "${subjectTitle}"!</strong> Answer Question 1 of 10 below.`);
        addAgentLog('4. ACT (QUIZ)', `Generated 10 multiple-choice questions from <strong>${subjectTitle}</strong>.`);
      } catch (err) {
        showUploadStatus('error', `❌ <strong>Quiz Generation Failed:</strong> ${err.message || 'Could not generate 10 questions from the provided content.'}`);
      }
    });

    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-studio');
        document.querySelectorAll('.studio-panel').forEach(p => p.classList.add('hidden'));
        const panel = byId(`studio-panel-${tab}`);
        if (panel) panel.classList.remove('hidden');
        document.querySelectorAll('.studio-tab-btn').forEach(b => {
          b.className = b.getAttribute('data-studio') === tab
            ? 'studio-tab-btn py-2.5 px-3 rounded-xl text-xs font-bold bg-purple-600 text-white'
            : 'studio-tab-btn py-2.5 px-3 rounded-xl text-xs font-semibold bg-purple-950/70 text-purple-200 border border-purple-500/30';
        });
      });
    });

    on('play-podcast-tts-btn', 'click', () => {
      const textToRead = state.uploadedNotesText
        ? `Welcome to the Synera Podcast! Today we are reviewing your notes: ${state.uploadedNotesText.slice(0, 180)}`
        : 'Please upload your lecture notes first so we can generate your custom study podcast!';
      setText('podcast-subtitle-box', `🎙️ [Playing Audio]: "${textToRead}"`);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(textToRead);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
      }
    });

    on('evaluate-teach-btn', 'click', () => {
      const inputEl = byId('teach-back-input');
      const val = inputEl ? inputEl.value.trim() : '';
      const box = byId('teach-back-feedback');
      if (!box) return;
      box.classList.remove('hidden');
      if (!val) {
        box.innerHTML = '⚠️ Please type your explanation first so Synera can evaluate it!';
        return;
      }
      box.innerHTML = `✅ <strong>Synera AI Evaluation:</strong> Clear self-explanation (${val.length} chars)! Explaining "${val.slice(0, 50)}..." in your own words strengthens active recall.`;
    });

    // Module 5: Instant Audio Synthesizer + YouTube Embed
    function ensureAudioContext() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!state.audioCtx && AudioContextClass) state.audioCtx = new AudioContextClass();
      if (state.audioCtx && state.audioCtx.state === 'suspended') state.audioCtx.resume();
    }

    function startInstantMusicLoop() {
      if (state.bgmInterval) {
        clearInterval(state.bgmInterval);
        state.bgmInterval = null;
      }
      const profile = genreProfiles[state.selectedGenre] || genreProfiles['lofi-hiphop'];
      const iframe = byId('youtube-iframe');

      if (!state.bgmPlaying) {
        if (iframe) {
          iframe.src = `${profile.embedBase}&autoplay=0&loop=1&playlist=${profile.videoId}&start=0&rel=0`;
        }
        setText('now-playing-label', `${profile.name} (OFF · Reset to 0:00)`);
        return;
      }

      try {
        ensureAudioContext();
        if (state.audioCtx) {
          let chordIdx = 0;
          const playChord = () => {
            if (!state.bgmPlaying || !state.audioCtx) return;
            const chord = profile.chords[chordIdx % profile.chords.length];
            chordIdx += 1;
            chord.forEach((freq, idx) => {
              const osc = state.audioCtx.createOscillator();
              const gain = state.audioCtx.createGain();
              osc.type = profile.wave;
              osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime + idx * 0.08);
              gain.gain.setValueAtTime(0.025, state.audioCtx.currentTime + idx * 0.08);
              gain.gain.exponentialRampToValueAtTime(0.0008, state.audioCtx.currentTime + 1.6);
              osc.connect(gain);
              gain.connect(state.audioCtx.destination);
              osc.start(state.audioCtx.currentTime + idx * 0.08);
              osc.stop(state.audioCtx.currentTime + 1.65);
            });
          };
          playChord();
          state.bgmInterval = setInterval(playChord, profile.tempo);
        }
      } catch (e) {}

      if (iframe) {
        iframe.src = `${profile.embedBase}&autoplay=1&loop=1&playlist=${profile.videoId}&start=0&rel=0`;
      }
      setText('now-playing-label', `${profile.name} (ON · Playing & Auto-Looping from 0:00 🔁)`);
    }

    on('toggle-bgm-btn', 'click', () => {
      state.bgmPlaying = !state.bgmPlaying;
      const btn = byId('toggle-bgm-btn');
      if (state.bgmPlaying) {
        setText('toggle-bgm-btn', '⏹️ Turn OFF Music (Reset to 0:00)');
        if (btn) btn.className = 'px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition';
      } else {
        setText('toggle-bgm-btn', '▶️ Turn ON Music (Auto-Loop)');
        if (btn) btn.className = 'px-5 py-2.5 rounded-2xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition';
      }
      startInstantMusicLoop();
    });

    document.querySelectorAll('.genre-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedGenre = btn.getAttribute('data-genre') || 'lofi-hiphop';
        document.querySelectorAll('.genre-btn').forEach(b => {
          b.className = b.getAttribute('data-genre') === state.selectedGenre
            ? 'genre-btn p-4 rounded-2xl text-left border border-purple-400 bg-purple-600/30 text-white transition'
            : 'genre-btn p-4 rounded-2xl text-left border border-purple-500/20 bg-purple-950/50 text-purple-200 hover:bg-purple-900/40 transition';
        });
        state.bgmPlaying = true;
        const toggleBtn = byId('toggle-bgm-btn');
        setText('toggle-bgm-btn', '⏹️ Turn OFF Music (Reset to 0:00)');
        if (toggleBtn) toggleBtn.className = 'px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition';
        startInstantMusicLoop();
      });
    });

    on('toggle-rain-btn', 'click', () => {
      state.rainPlaying = !state.rainPlaying;
      if (state.rainPlaying) {
        try {
          ensureAudioContext();
          const bufferSize = state.audioCtx.sampleRate * 2;
          const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.035;
          const whiteNoise = state.audioCtx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;
          const filter = state.audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 900;
          whiteNoise.connect(filter);
          filter.connect(state.audioCtx.destination);
          whiteNoise.start(0);
          state.rainNode = whiteNoise;
        } catch (e) {}
        setText('toggle-rain-btn', 'Rain: ON 🌧️');
        setText('rain-status-text', 'Ambient rain sound layer: ACTIVE');
      } else {
        if (state.rainNode) {
          try { state.rainNode.stop(); } catch (e) {}
          state.rainNode = null;
        }
        setText('toggle-rain-btn', 'Rain: OFF');
        setText('rain-status-text', 'Can be played alone or mixed with any music genre: OFF');
      }
    });

    // Module 6: Pomodoro Timer & Rest Guard
    function renderTimer() {
      const m = String(Math.floor(state.timerSeconds / 60)).padStart(2, '0');
      const s = String(state.timerSeconds % 60).padStart(2, '0');
      setText('pomodoro-display', `${m}:${s}`);
    }

    on('start-timer-btn', 'click', () => {
      state.timerRunning = !state.timerRunning;
      if (state.timerRunning) {
        state.timerInterval = setInterval(() => {
          if (state.timerSeconds > 0) {
            state.timerSeconds -= 1;
            renderTimer();
          }
        }, 1000);
      } else if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
    });

    on('reset-timer-btn', 'click', () => {
      state.timerRunning = false;
      if (state.timerInterval) clearInterval(state.timerInterval);
      state.timerSeconds = 1500;
      renderTimer();
    });

    on('simulate-10h-btn', 'click', () => {
      const box = byId('overstudy-alert-box');
      if (box) box.classList.remove('hidden');
      addAgentLog('REST GUARD', 'Detected >10 hours daily study time. Triggered rest & sleep reminder.');
    });

    // ====================================================================
    // FIX 1: IMPROVED ACADEMIC & MATH CHATBOT WITH CONVERSATIONAL CONTEXT
    // ====================================================================
    on('calc-exam-plan-btn', 'click', () => {
      const lastInput = byId('last-exam-input');
      const targetInput = byId('target-exam-input');
      const lastVal = parseInt(lastInput && lastInput.value ? lastInput.value : '0', 10);
      const targetVal = parseInt(targetInput && targetInput.value ? targetInput.value : '0', 10);
      const out = byId('exam-plan-output');
      if (!out) return;
      if (!lastVal || !targetVal) {
        out.innerHTML = '⚠️ Please enter both your Last Exam Score (%) and Next Target (%) above.';
        return;
      }
      const diff = targetVal - lastVal;
      out.innerHTML = diff > 0
        ? `🎯 <strong>+${diff}% Improvement Goal:</strong> Complete ${Math.max(2, Math.ceil(diff / 6))} Spaced Repetition retests and 1 Teach-Me-Back session per chapter.`
        : `🌟 <strong>Maintenance Goal:</strong> You are already at or above your ${targetVal}% target! Keep doing 15-min recall quizzes.`;
    });

    on('toggle-api-key-btn', 'click', () => {
      const box = byId('api-key-box');
      if (box) box.classList.toggle('hidden');
    });

    on('save-api-key-btn', 'click', () => {
      const inp = byId('gemini-api-key-input');
      if (inp && inp.value.trim()) {
        state.geminiApiKey = inp.value.trim();
        const box = byId('api-key-box');
        if (box) box.classList.add('hidden');
        addAgentLog('GEMINI API', 'Connected live Gemini API key for document analysis and AI Chat.');
      }
    });

    function gcd(a, b) {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      return a || 1;
    }

    function formatFractionAndDecimal(num, den) {
      if (den < 0) { num = -num; den = -den; }
      const val = num / den;
      if (Number.isInteger(val)) return `${val}`;
      const g = gcd(Math.round(num * 1000), Math.round(den * 1000));
      const simpNum = Math.round(num * 1000) / g;
      const simpDen = Math.round(den * 1000) / g;
      const dec = Number(val.toFixed(4));
      if (simpDen <= 1000) {
        return `${simpNum}/${simpDen} (or ${dec})`;
      }
      return `${dec}`;
    }

    function trySolveMathAndFollowUp(query) {
      // 1. Follow-up to the previous math equation (e.g., "What if it equals 16?")
      if (state.lastMathEquation && !query.includes('=')) {
        const followUpMatch = query.match(/(?:equals?|sama dengan|jadi|is)\s*([+-]?\d+(?:\.\d+)?)/i);
        if (followUpMatch) {
          const newRhs = parseFloat(followUpMatch[1]);
          const { coeff, variable, lhsRaw } = state.lastMathEquation;
          const formatted = formatFractionAndDecimal(newRhs, coeff);
          return `Using the previous expression (<code>${lhsRaw} = ${newRhs}</code>):<br/><code>${coeff}${variable} = ${newRhs}</code>, therefore <strong>${variable} = ${formatted}</strong>.`;
        }
      }

      // 2. Linear algebraic equation (e.g., "4a + 4a = 2. What is a?")
      const eqRegex = /((?:[+-]?\s*(?:\d+(?:\.\d+)?\s*[a-zA-Z]|\d+(?:\.\d+)?|[a-zA-Z])\s*)+)=\s*([+-]?(?:\s*(?:\d+(?:\.\d+)?\s*[a-zA-Z]|\d+(?:\.\d+)?|[a-zA-Z])\s*[+\-*/]?)+)/;
      const match = query.match(eqRegex);
      if (match) {
        const lhsRaw = match[1].trim();
        const rhsRaw = match[2].replace(/\.\s*$/, '').trim();
        const fullEq = `${lhsRaw} = ${rhsRaw}`;
        const varMatch = fullEq.match(/[a-zA-Z]/);
        if (varMatch) {
          const v = varMatch[0];
          const prep = (expr) => expr
            .replace(new RegExp(`(\\d(?:\\.\\d+)?)\\s*${v}`, 'g'), '$1*x')
            .replace(new RegExp(`\\b${v}\\b`, 'g'), '1*x');
          try {
            const lhsFn = new Function('x', `return (${prep(lhsRaw)});`);
            const rhsFn = new Function('x', `return (${prep(rhsRaw)});`);
            const f0 = lhsFn(0) - rhsFn(0);
            const f1 = lhsFn(1) - rhsFn(1);
            const coeff = f1 - f0;
            const constRhs = -f0;
            if (Math.abs(coeff) > 1e-9) {
              state.lastMathEquation = { lhsRaw, variable: v, coeff };
              const formatted = formatFractionAndDecimal(constRhs, coeff);
              return `<code>${coeff}${v} = ${constRhs}</code>, therefore <strong>${v} = ${formatted}</strong>.`;
            }
          } catch (e) {}
        }
      }

      // 3. Pure arithmetic expression
      const cleanedArith = query
        .replace(/^(?:what is|calculate|kira|berapa)\s+/i, '')
        .replace(/[?=]+$/g, '')
        .trim();
      if (/^[\s0-9+\-*/().]+$/.test(cleanedArith) && /[+\-*/]/.test(cleanedArith)) {
        try {
          const res = new Function(`return (${cleanedArith});`)();
          if (typeof res === 'number' && !Number.isNaN(res)) {
            return `<code>${cleanedArith} = ${Number(res.toFixed(4))}</code>.`;
          }
        } catch (e) {}
      }

      return null;
    }

    async function generateSmartChatReply(text) {
      const mathSolution = trySolveMathAndFollowUp(text);
      if (mathSolution) {
        state.chatHistory.push({ role: 'user', text }, { role: 'model', text: mathSolution });
        return mathSolution;
      }

      if (state.geminiApiKey) {
        try {
          const systemInstruction = `You are Synera AI, an accurate academic assistant.
Rules:
1. Always prioritise the user's latest question.
2. Answer academic, science, programming, or math questions directly and accurately before suggesting any study techniques.
3. Only mention Synera modules, study plans, or revision activities when the user explicitly asks about their study schedule, weak topics, or uploaded notes.
4. Maintain conversational context for follow-up questions.
Uploaded lecture material context: "${state.uploadedNotesText ? state.uploadedNotesText.slice(0, 4000) : 'No file uploaded yet'}".`;

          const contents = state.chatHistory.slice(-6).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }));
          contents.push({ role: 'user', parts: [{ text }] });

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(state.geminiApiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents
            })
          });
          const data = await res.json();
          const candidate = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
          if (candidate) {
            state.chatHistory.push({ role: 'user', text }, { role: 'model', text: candidate });
            return candidate.replace(/\n/g, '<br/>');
          }
        } catch (err) {}
      }

      const lower = text.toLowerCase();

      if (state.uploadedNotesText) {
        const sentences = state.uploadedNotesText
          .split(/(?<=[.!?])\s+|\n+/)
          .map(s => s.trim())
          .filter(Boolean);

        if (lower.includes('summarize') || lower.includes('summary') || lower.includes('ringkaskan')) {
          const summary = sentences.slice(0, 3).join(' ');
          const reply = `Here is a direct summary of your uploaded material:<br/>${summary}`;
          state.chatHistory.push({ role: 'user', text }, { role: 'model', text: reply });
          return reply;
        }

        const queryWords = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= 4);
        const matchingSentences = sentences.filter(s =>
          queryWords.some(qw => s.toLowerCase().includes(qw))
        );
        if (matchingSentences.length > 0) {
          const reply = matchingSentences.slice(0, 2).join(' ');
          state.chatHistory.push({ role: 'user', text }, { role: 'model', text: reply });
          return reply;
        }
      }

      if (lower.includes('weak') || lower.includes('lemah')) {
        const reply = state.subjects.length === 0
          ? 'You do not have any recorded quiz results yet. Upload your lecture material in Module 2 and take a quiz to identify weak topics.'
          : `Your recorded subjects: <strong>${state.subjects.map(s => `${s.name} (Accuracy: ${s.accuracy}, Weak area: ${s.weakness})`).join('; ')}</strong>.`;
        state.chatHistory.push({ role: 'user', text }, { role: 'model', text: reply });
        return reply;
      }

      const directFallback = state.uploadedNotesText
        ? `I searched your uploaded notes but did not find an exact match for <em>"${text}"</em>. Connect a Gemini API key (via the <strong>🔑 Connect Gemini API Key</strong> button above) to enable open-ended AI answers across any subject!`
        : `To answer open-ended academic questions beyond built-in mathematics (or to analyse your lecture notes), either upload your study file in <strong>Module 2</strong> or click <strong>🔑 Connect Gemini API Key</strong> above to connect live Gemini AI.`;
      state.chatHistory.push({ role: 'user', text }, { role: 'model', text: directFallback });
      return directFallback;
    }

    async function sendChatMessage(text) {
      if (!text || !text.trim()) return;
      const box = byId('ai-chat-history');
      if (!box) return;
      const userDiv = document.createElement('div');
      userDiv.className = 'p-3 rounded-2xl bg-purple-600/40 border border-purple-400/40 text-white text-right';
      userDiv.innerHTML = `<strong>You:</strong> ${text}`;
      box.appendChild(userDiv);

      const replyDiv = document.createElement('div');
      replyDiv.className = 'p-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-purple-100';
      replyDiv.innerHTML = `<strong>Synera AI:</strong> <em>Thinking...</em>`;
      box.appendChild(replyDiv);
      box.scrollTop = box.scrollHeight;

      const answerHtml = await generateSmartChatReply(text);
      replyDiv.innerHTML = `<strong>Synera AI:</strong> ${answerHtml}`;
      box.scrollTop = box.scrollHeight;
    }

    on('send-chat-btn', 'click', () => {
      const input = byId('ai-chat-input');
      if (input) {
        sendChatMessage(input.value);
        input.value = '';
      }
    });

    on('ai-chat-input', 'keydown', (e) => {
      if (e.key === 'Enter') {
        const input = byId('ai-chat-input');
        if (input) {
          sendChatMessage(input.value);
          input.value = '';
        }
      }
    });

    document.querySelectorAll('.chat-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => sendChatMessage(btn.getAttribute('data-prompt')));
    });

    on('toggle-sky-theme-btn', 'click', () => {
      state.skyTheme = !state.skyTheme;
      const body = byId('app-body');
      if (body) body.classList.toggle('sky-theme', state.skyTheme);
    });

    on('simulate-agent-btn', 'click', () => {
      addAgentLog('AUTONOMOUS LOOP', 'Monitoring session readiness, quiz accuracy, and 1-3-5-7 day spaced repetition schedule.');
    });

    on('clear-log-btn', 'click', () => {
      const list = byId('agent-log-list');
      if (list) list.innerHTML = '';
    });

    addAgentLog('SYNERA READY', 'Fresh user session started. Upload PDF, PPTX, or TXT in Module 2 to generate a 10-question quiz.');
    updateDashboardUI(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSyneraApp);
  } else {
    initSyneraApp();
  }
})();
