

const socket = io('http://localhost:5000');

//* Get references to DOM elements
const wsStatus = document.getElementById('ws-status');
const dashboardCount = document.getElementById('dashboard-count');
const activeVisitors = document.getElementById('active-visitors');
const visitorFeed = document.getElementById('visitor-events');
const totalVisitor = document.getElementById('total-visitors');
const sessionLists = document.getElementById('session-list');

//* Track session activity in-memory
const session = {};

//* When WebSocket connection is established
socket.on('connect', () => {
  wsStatus.textContent = 'Connected';
  wsStatus.style.color = 'green';
});

//* When WebSocket disconnects
socket.on('disconnect', () => {
  wsStatus.textContent = 'Disconnected';
  wsStatus.style.color = 'red';
});

//* When a new dashboard client connects
socket.on('user_connected', data => {
  dashboardCount.textContent = data.data.totalDashboards;     // Total dashboard clients
  totalVisitor.textContent = data.data.totalToday;            // Total visitors today

  const li = document.createElement('li');
  const evt = data.data;
  li.textContent = ` ${evt.id} is connected at  [${evt.connectedAt}]`;
  visitorFeed.prepend(li);  // Add to the top of visitor feed
  console.log('User connected:', data);
});

//* When a dashboard disconnects
socket.on('user_disconnected', data => {
  const li = document.createElement('li');
  const evt = data.data;
  li.textContent = ` ${evt.id} is disconnected at  [${evt.disConnectedAt}] online for ${Math.round(evt.diff)}s`;
  visitorFeed.prepend(li);
  console.log(`Dashboard was connected for ${evt.diff} seconds`);
});

//* When a new visitor event occurs
socket.on('visitor_update', data => {
  console.log('New visitor event:', data);

  activeVisitors.textContent = data.data.stats.totalActive;
  totalVisitor.textContent = data.data.stats.totalToday;

  const li = document.createElement('li');
  const evt = data.data.event;
  li.textContent = `[${evt.timestamp}] ${evt.sessionId}  ${evt.type} and visited ${evt.page} from ${evt.country}`;
  visitorFeed.prepend(li);
});

//* When session activity data is received
socket.on('session_activity', data => {
  const { sessionId, currentPage, journey, duration } = data.data;
  // Store and update session information
  session[sessionId] = { currentPage, journey, duration };
  renderSessions();  // Re-render session list in UI
});

//* When an alert message is received
socket.on('alert', data => {
  const alertsList = document.getElementById('alerts-list');
  const { level, message, sessionId, details } = data.data;

  const li = document.createElement('li');
  li.innerHTML = `
    <strong>[${level.toUpperCase()}]</strong> user(${details.sender}) => ${message}
    ${sessionId ? `<br><em>Session: ${sessionId}</em>` : ''}
    <br><small>${details.sentAt}</small> 
  `;
  alertsList.prepend(li);  //for adding top of the list
});

//* Handle response to filter request
socket.on('filtered_stats', (msg) => {
  const events = msg.data;
  if (!events || events.length === 0) {
    renderView({ message: 'No matching data.' });
    return;
  }
  const structuredData = {};


  events.forEach(evt => {
    const { country, sessionId, page } = evt;

    if (!country || !sessionId || !page) return;      //if no data present

    if (!structuredData[country]) {
      structuredData[country] = {};
    }

    if (!structuredData[country][sessionId]) {
      structuredData[country][sessionId] = { visit: {} };
    }

    if (!structuredData[country][sessionId].visit[page]) {
      structuredData[country][sessionId].visit[page] = 1;
    } else {
      structuredData[country][sessionId].visit[page]++;
    }
  });

  renderView(structuredData);
});



//? Render the structured result in a styled, readable way

function renderView(data) {
  const output = document.getElementById('structured-output');
  output.innerHTML = ''; // Clear previous

  if (data.message) {
    output.textContent = data.message;
    return;
  }

  for (const country in data) {
    const countryDiv = document.createElement('div');
    countryDiv.className = 'country-block';
    countryDiv.innerHTML = `<strong>🌍 Country: ${country}</strong>`;

    const users = data[country];
    for (const sessionId in users) {
      const visitorDiv = document.createElement('div');
      visitorDiv.className = 'visitor-block';
      visitorDiv.innerHTML = `<strong>👤 Visitor: ${sessionId}</strong>`;

      const visitData = users[sessionId].visit;
      for (const page in visitData) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-item';
        pageDiv.textContent = `• ${page}: ${visitData[page]} visit${visitData[page] > 1 ? 's' : ''}`;
        visitorDiv.appendChild(pageDiv);
      }

      countryDiv.appendChild(visitorDiv);
    }

    output.appendChild(countryDiv);
  }
}


//? Renders the session list in the UI

function renderSessions() {
  sessionLists.innerHTML = ''; // Clear previous list

  Object.entries(session).forEach(([id, session]) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${id}</strong><br>
      Current Page: <code>${session.currentPage}</code><br>
      Journey: ${session.journey.join(' → ')}<br>
      Duration: ${Math.round(session.duration)}s
    `;
    sessionLists.appendChild(li);
  });
}

//? Sends a message to all dashboards or to a specific session
function sendMessage() {
  const input = document.getElementById('msg-input');
  const sessionInput = document.getElementById('msg-session');
  const level = document.getElementById('msg-level').value;

  const message = input.value.trim();
  const sessionId = sessionInput.value.trim();

  if (!message) return;  // handle empty messages

  socket.emit('send_message', {
    type: 'send_message',
    data: {
      level,
      message,
      sessionId: sessionId || null,
      sentAt: new Date().toISOString()
    }
  });

  // Clear inputs
  input.value = '';
  sessionInput.value = '';
}


// Apply filters for structured visitor analytics

function applyFilters() {
  const country = document.getElementById('filter-country').value.trim();
  const page = document.getElementById('filter-page').value.trim();

  const filter = {};
  if (country) filter.country = country;
  if (page) filter.page = page;

  // Emit a WebSocket event to request filtered stats
  socket.emit('request_detailed_stats', {
    type: 'request_detailed_stats',
    filter
  });

  // Track filtering action
  socket.emit('track_dashboard_action', {
    type: 'track_dashboard_action',
    action: 'filter_applied',
    details: {
      filterType: country && page ? 'both' : country ? 'country' : 'page',
      value: country && page ? `${country} & ${page}` : country || page
    }
  });

  console.log('Filter sent via WebSocket:', filter);
}


// Reset filters and clear output
function resetFilter() {
  document.getElementById('filter-country').value = '';
  document.getElementById('filter-page').value = '';
  document.getElementById('structured-output').innerHTML = '';
  applyFilters();
}
