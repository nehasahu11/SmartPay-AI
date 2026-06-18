// voiceAssistant.js - Web Speech API integration for SmartPay AI
// Listens for voice commands, matches them against known intents, and triggers actions

(function () {
  // ---------- Browser Support Check ----------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('Web Speech API not supported in this browser.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let isListening = false;

  const COMMAND_INTENTS = [
    {
      name: 'recharge_mobile',
      phrases: ['recharge my mobile', 'mobile recharge', 'recharge phone'],
      action: () => navigateAndPrefill('recharge.html', 'rechargeType', 'mobile')
    },
    {
      name: 'recharge_dth',
      phrases: ['recharge dth', 'recharge my dth', 'dth recharge'],
      action: () => navigateAndPrefill('recharge.html', 'rechargeType', 'dth')
    },
    {
      name: 'recharge_fastag',
      phrases: ['recharge fastag', 'recharge my fastag', 'fastag recharge'],
      action: () => navigateAndPrefill('recharge.html', 'rechargeType', 'fastag')
    },
    {
      name: 'show_transactions',
      phrases: ['show my transactions', 'show transactions', 'recent transactions', 'transaction history'],
      action: () => navigateTo('dashboard.html')
    },
    {
      name: 'show_analytics',
      phrases: ['show spending analytics', 'show analytics', 'spending analytics', 'show my analytics'],
      action: () => navigateTo('analytics.html')
    },
    {
      name: 'predict_electricity',
      phrases: ['predict next electricity bill', 'predict electricity bill', 'predict my electricity bill'],
      action: () => navigateAndPrefill('bills.html', 'predictBillType', 'electricity', true)
    },
    {
      name: 'predict_water',
      phrases: ['predict next water bill', 'predict water bill'],
      action: () => navigateAndPrefill('bills.html', 'predictBillType', 'water', true)
    },
    {
      name: 'predict_gas',
      phrases: ['predict next gas bill', 'predict gas bill'],
      action: () => navigateAndPrefill('bills.html', 'predictBillType', 'gas', true)
    },
    {
      name: 'predict_broadband',
      phrases: ['predict next broadband bill', 'predict broadband bill'],
      action: () => navigateAndPrefill('bills.html', 'predictBillType', 'broadband', true)
    },
    {
      name: 'show_bills',
      phrases: ['show my bills', 'pay bills', 'bill payments', 'show bill payments'],
      action: () => navigateTo('bills.html')
    },
    {
      name: 'go_home',
      phrases: ['go to dashboard', 'open dashboard', 'home'],
      action: () => navigateTo('dashboard.html')
    }
  ];

  function matchCommand(transcript) {
    const text = transcript.toLowerCase().trim();
    for (const intent of COMMAND_INTENTS) {
      for (const phrase of intent.phrases) {
        if (text.includes(phrase)) {
          return intent;
        }
      }
    }
    return null;
  }

  function navigateTo(page) {
    if (window.location.pathname.endsWith(page)) {
      showToast('Already on this page.', 'success');
      return;
    }
    window.location.href = page;
  }

  function navigateAndPrefill(page, fieldId, value, autoTriggerPredict = false) {
    sessionStorage.setItem('voicePendingAction', JSON.stringify({ fieldId, value, autoTriggerPredict }));
    if (window.location.pathname.endsWith(page)) {
      applyPendingAction();
    } else {
      window.location.href = page;
    }
  }

  function applyPendingAction() {
    const pending = sessionStorage.getItem('voicePendingAction');
    if (!pending) return;

    sessionStorage.removeItem('voicePendingAction');
    const { fieldId, value, autoTriggerPredict } = JSON.parse(pending);

    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value;
      if (autoTriggerPredict) {
        const predictBtn = document.getElementById('predictBillBtn');
        if (predictBtn) predictBtn.click();
      } else {
        showToast(`Voice command applied: ${fieldId} set to "${value}"`, 'success');
      }
    }
  }

  async function logVoiceCommand(commandText, recognizedAction, status) {
    try {
      await apiRequest('/voice/log', 'POST', { commandText, recognizedAction, status });
    } catch (err) {
      console.warn('Voice log failed silently:', err);
    }
  }

  recognition.onstart = () => {
    isListening = true;
    updateMicButton(true);
    showToast('Listening...', 'success');
  };

  recognition.onend = () => {
    isListening = false;
    updateMicButton(false);
  };

  recognition.onerror = (event) => {
    isListening = false;
    updateMicButton(false);

    if (event.error === 'no-speech') {
      showToast('No speech detected. Try again.', 'danger');
    } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      showToast('Microphone access denied. Please allow microphone permissions.', 'danger');
    } else {
      showToast('Voice recognition error. Please try again.', 'danger');
    }
  };

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    const matchedIntent = matchCommand(transcript);

    if (matchedIntent) {
      showToast(`Heard: "${transcript}" → ${matchedIntent.name.replace(/_/g, ' ')}`, 'success');
      await logVoiceCommand(transcript, matchedIntent.name, 'executed');
      matchedIntent.action();
    } else {
      showToast(`Heard: "${transcript}" — command not recognized.`, 'danger');
      await logVoiceCommand(transcript, null, 'unrecognized');
    }
  };

  function updateMicButton(listening) {
    const btn = document.getElementById('voiceAssistantBtn');
    if (!btn) return;
    btn.classList.toggle('listening', listening);
    btn.textContent = listening ? '🔴' : '🎙️';
  }

  function startListening() {
    if (isListening) return;
    try {
      recognition.start();
    } catch (err) {
      console.error('Could not start recognition:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('voiceAssistantBtn');
    if (micBtn) {
      micBtn.addEventListener('click', startListening);
    }
    applyPendingAction();
  });

  window.SmartPayVoice = { startListening, matchCommand };
})();