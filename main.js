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

const filterPusherEmployees = (commits) => {
  const engineers = [
    'DanielWaterworth',
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
    'zimbatm',
  ];
  engineers.forEach((username) => {
    if (commits[username]) {
      delete commits[username];
    }
  });
  return Promise.resolve(commits);
};

const renderTable = (commits) => {
  const html = Object.keys(commits).map((username, index) => {
    const numCommits = commits[username];
    return template(index+1, username, numCommits);
  }).join('');
  document.querySelector('#leaderboard tbody').innerHTML = html;

  const table = document.getElementById('leaderboard');
  Sortable.init(table);
};

fetchData()
  .then(filterPusherEmployees)
  .then(renderTable);
