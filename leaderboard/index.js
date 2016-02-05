'use strict';

// LIB

class DataStore {
  constructor () {
    this.commits = [];
    this.isInternal = false;
    this.currentPusherEngineers = [
      'Nicowcow',
      'WillSewell',
      'alexpate',
      'benfoxall',
      'ewmy',
      'frogvalley',
      'hamchapman',
      'jackfranklin',
      'jamescun',
      'jpatel531',
      'maxthelion',
      'mdpye',
      'olgad123',
      'olgagithub',
      'pl',
      'pusher-ci',
      'pusher-dashboard',
      'pusher-puppet',
      'seeemilyplay',
      'stealthpig',
      'sylg',
      'topliceanu',
      'vivangkumar',
      'zimbatm'
    ];
    this.pastPusherEngineers = [
      "DanielWaterworth",
      "dctanner",
      "leggetter",
      "maryrosecook",
      "mloughran",
      "robhawkes"
    ];
  }

  getScores() {
    const commits = this.commits.slice(0);
    const scores = this._applyScore(commits);
    let filtered = null;
    if (this.isInternal) {
      filtered = this._filterIn(scores, this.currentPusherEngineers);
    }
    else {
      filtered = this._filterOut(scores, this.currentPusherEngineers);
      filtered = this._filterOut(filtered, this.pastPusherEngineers);
    }
    const sorted = this._sort(filtered);
    return sorted;
  }

  // algo: P / (T+2)^G
  // @param commits [[username, timestamp],...]
  // @return [[username, score, numCommits]]
  _applyScore (commits) {
    const now = Math.floor(Date.now() / 1000);
    const gravity = 1.8;
    const numCommits = {};
    const lastCommitDelta = {};

    commits.forEach((commit) => {
      const username = commit[0];
      const timestamp = commit[1];

      // Sum commits.
      if (!numCommits[username]) {
        numCommits[username] = 0;
      }
      numCommits[username] += 1

      // Compute deltas.
      if (!lastCommitDelta[username] || lastCommitDelta[username] < timestamp) {
        lastCommitDelta[username] = (now - timestamp) / 60;
      }
    });

    return Object.keys(numCommits).reduce((collector, username) => {
      const score = numCommits[username] / Math.pow(lastCommitDelta[username] + 2, gravity);
      collector.push([username, score, numCommits[username]]);
      return collector;
    }, []);
  }


  // @param scores [[username, score, numCommits],...]
  // @param usernames [username]
  // @return [[username, score, numCommits],...]
  _filterIn (scores, usernames) {
    return scores.reduce((collector, item) => {
      const username = item[0];
      if (usernames.indexOf(username) !== -1) {
        collector.push(item);
      }
      return collector;
    }, []);
  }

  // @param scores [[username, score, numCommits],...]
  // @param usernames [username]
  // @return [[username, score, numCommits],...]
  _filterOut (scores, usernames) {
    return scores.reduce((collector, item) => {
      const username = item[0];
      if (usernames.indexOf(username) === -1) {
        collector.push(item);
      }
      return collector;
    }, []);
  }

  _sort (scores) {
    return scores.sort((a, b) => {
      if (a[1] < b[1]) {
        return 1;
      }
      if (a[1] > b[1]) {
        return -1;
      }
      return 0;
    });
  }
}

const fetchInitial = (endpoint) => {
  return new Promise((resolve) => {
    $.getJSON(endpoint).then((response) => {
      const results = Object.keys(response.commits).map((index) => {
        const item = response.commits[index];
        return [item.username, item.timestamp];
      });
      resolve(results);
    });
  });
};

const onNotifications = (appKey, channel, event, handler) => {
  const pusher = new Pusher(appKey);
  var channel = pusher.subscribe(channel);
  channel.bind(event, (commit) => {
    handler([commit.username, commit.ts]);
  });
};

const template = (username, score, numCommits) => {
  return `
    <tr>
      <td>
        ${score}
      <\/td>
      <td>
        <a href="http://github.com/${username}">github.com/${username}<\/a>
      <\/td>
      <td>
        ${numCommits}
      <\/td>
    <\/tr>
  `;
};

// @param canvas DOMELement.
// @param commits [[username, timestamp],...]
const render = (canvas, commits) => {
  const html = commits.map((item, index) => {
    const username = item[0];
    const score = item[1];
    const numCommits = item[2];
    return template(username, score, numCommits);
  }).join('');
  canvas.innerHTML = html;
};


// MAIN

const API_ENDPOINT = 'https://stark-tundra-99918.herokuapp.com/api/commits/pusher?since=1423146000';
const APP_ID = '150226';
const APP_KEY = '61dbfafde623432a30d4';
const APP_SECRET = '555b8b7b9ca6006105fd';
const PUSHER_CHANNEL = 'my_channel';
const PUSHER_EVENT = 'new_message';


const dataStore = new DataStore();
const canvas = document.querySelector('#canvas');

// Initial data from the API.
// @param commits [[username, timestamp],...]
fetchInitial(API_ENDPOINT).then((commits) => {
  commits.forEach((commit) => {
    dataStore.commits.push(commit);
  });
  const scores = dataStore.getScores();
  render(canvas, scores);
});


// Internal contributions checkbox.
$('input[type=checkbox]').on('click', (ev) => {
  dataStore.isInternal = $(ev.target).is(':checked');
  const scores = dataStore.getScores();
  render(canvas, scores);
});


// Push notifications.
// @param commit [username, timestamp]
onNotifications(APP_KEY, PUSHER_CHANNEL, PUSHER_EVENT, (commit) => {
  dataStore.commits.push(commit);
  const scores = dataStore.getScores();
  render(canvas, scores);
});
