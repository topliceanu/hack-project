'use strict';

const template = (index, username, numCommits) => {
  return `
    <tr>
      <td>
        <a href="http://github.com/${username}">${username}<\/a>
      <\/td>
      <td data-value="${numCommits}">${numCommits}<\/td>
    <\/tr>
  `;
};

const fetchData = () => {
  const insert = function (data, newData) {
    Object.keys(newData).forEach((repo) => {
      Object.keys(newData[repo]).forEach((username) => {
        if (!data[username]) {
          data[username] = newData[repo][username];
        }
        else {
          data[username] += newData[repo][username];
        }
      });
    });
  };
  const commits = {};
  return Promise.all([
    $.getJSON('https://stark-tundra-99918.herokuapp.com/api/pusher/'),
    $.getJSON('https://stark-tundra-99918.herokuapp.com/api/pusher-community/')
  ]).then((results) => {
    insert(commits, results[0]);
    insert(commits, results[1]);
    return Promise.resolve(commits);
  });
};

const filterOutPusherEmployees = (commits) => {
  const engineers = [
    'DanielWaterworth',
    'Nicowcow',
    'WillSewell',
    'alexpate',
    'benfoxall',
    'dctanner',
    'ewmy',
    'frogvalley',
    'hamchapman',
    'jackfranklin',
    'jamescun',
    'jpatel531',
    'leggetter',
    'maryrosecook',
    'maxthelion',
    'mdpye',
    'mloughran',
    'olgad123',
    'olgagithub',
    'pl',
    'pusher-ci',
    'pusher-dashboard',
    'pusher-puppet',
    'robhawkes',
    'seeemilyplay',
    'stealthpig',
    'sylg',
    'topliceanu',
    'vivangkumar',
    'zimbatm'
  ];
  engineers.forEach((username) => {
    if (commits[username]) {
      delete commits[username];
    }
  });
  return Promise.resolve(commits);
};

const filterInPusherEmployees = (commits) => {
  const engineers = [
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
  const filtered = engineers.reduce((collector, username) => {
    if (commits[username]) {
      collector[username] = commits[username];
    }
    return collector;
  }, {});
  return Promise.resolve(filtered);
};

const sortDescByCommits = (commits) => {
  const sorted = Object.keys(commits).map((username) => {
    return [username, commits[username]]
  }).sort((a, b) => {
      if (a[1] < b[1]) {
        return 1;
      }
      if (a[1] > b[1]) {
        return -1;
      }
      return 0;
  });
  return Promise.resolve(sorted);
};

const renderTable = (commits) => {
  const html = commits.map((item, index) => {
    const username = item[0];
    const numCommits = item[1];
    return template(index+1, username, numCommits);
  }).join('');
  document.querySelector('#leaderboard tbody').innerHTML = html;
};

fetchData()
  .then(filterOutPusherEmployees)
  .then(sortDescByCommits)
  .then(renderTable);

$('input[type=checkbox]').on('click', (ev) => {
  const isChecked = $(ev.target).is(':checked');
  if (!isChecked) {
    fetchData()
      .then(filterOutPusherEmployees)
      .then(sortDescByCommits)
      .then(renderTable);
  }
  else {
    fetchData()
      .then(filterInPusherEmployees)
      .then(sortDescByCommits)
      .then(renderTable);
  }
});
