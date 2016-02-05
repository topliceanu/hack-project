import json
import urllib2
​
#github author
token = 'token 3bf1eb3db07add3854afaf6c715247c2713b8b21'
headers = { 'Authorization' : token }
​
req = urllib2.Request("https://api.github.com/orgs/pusher/repos", headers)
response = urllib2.urlopen(req)
opener = urllib2.build_opener()
f = opener.open(req)
repos = json.loads(f.read())
​
for i in range (0, len(repos)):
    print repos[i]['name']
    url = "https://api.github.com/repos/pusher/" + repos[i]['name'] + "/stats/contributors"
    req = urllib2.Request(url)
    opener = urllib2.build_opener()
    f = opener.open(req)
​
    if (f.code == 200):
        contribs = json.loads(f.read())
        for j in range (0, len(contribs)):
            print contribs[j]['author']['login']
    elif (f.code == 301):
        print "repo moved!"
