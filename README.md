# matchmaking

## API-Specification:
| METHOD | ROUTE                | RESPONSE                                                     | MEANING                                                                                                                |
|--------|----------------------|--------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| PUT    | /user                | 201 Created<br>422 Unprocessable Content<br>423 Locked       | user created<br>wrong UserAuthData format<br>user already exists                                                       |
| POST   | /user/login          | 200 OK<br>422 Unprocessable Content<br>401 Unauthorized      | cookie linked to session<br>wrong UserAuthData format<br>wrong login data                                              |
| POST   | /user/logout         | 200 OK<br>401 Unauthorized                                   | cookie set expired/unlinked<br>no logon                                                                                |
| DELETE | /user                | 200 OK<br>422 Unprocessable Content<br>401 Unauthorized      | user deleted<br>wrong UserAuthData format<br>wrong login data                                                          |
| GET    | /user                | 200 OK                                                       | sent user info (empty username field if no logon)                                                                      |
| PUT    | /matchmaking/queue   | 201 Created<br>422 Unprocessable Content<br>401 Unauthorized | created queue entry<br>wrong QueueData format<br>no logon                                                              |
| POST   | /matchmaking/queue   | 202 Accepted<br>400 Bad Request<br>401 Unauthorized          | accepted the ready queue <br>no queue ready to accept<br>no logon                                                      |
| DELETE | /matchmaking/queue   | 200 OK<br>401 Unauthorized                                   | exited queue (rejects ready queue)<br>no logon                                                                         |
| GET    | /matchmaking/queue   | 202 Accepted<br>201 Created<br>401 Unauthorized              | no match found yet<br>match found<br>no logon                                                                          |
| PUT    | /matchmaking/host    | 201 Created<br>422 Unprocessable Content<br>401 Unauthorized | added to match server list<br>wrong HostData format<br>no logon / no host privileges                                   |
| POST   | /matchmaking/host    | 200 OK<br>422 Unprocessable Content<br>401 Unauthorized      | host accepted found match<br>wrong HostData format for accepted match<br>no logon / no host privileges                 |
| DELETE | /matchmaking/host    | 200 OK<br>422 Unprocessable Content<br>401 Unauthorized      | deleted match servers from list / all match servers<br>wrong HostData format if given<br>no logon / no host privileges |
| GET    | /matchmaking/host    | 200 OK<br>201 No Content<br>401 Unauthorized                 | change in HostData<br>no change<br>no logon / no host privileges                                                       |
| PUT    | /matchmaking/history | 201 Created<br>208 Already Reported<br>401 Unauthorized      | reported back match result<br>redundant call<br>no logon / no host privileges                                          |



## Json-Specification:
```json
GET /user/
{"username" : "","privilege": 0	}
```

players can join the queue via PUT /matchmaking/queue
an empty request body or field in the request body assigns the player to all modes and estimates region by ip address.
modes can indicate team sizes with an infix lead by "-" that seperates natural number team sized with "v" :
```json
{"region" :"48°25'23.8\"N 9°57'33.7\"E","modes": ["rated-1v1","unrated-1v1","rated-2v2","unrated-2v2"]	}
```

##Privilege levels:

privilege is a user parameter that is stored as TINYINT
it restricts the scope of api calls 

0. Unauthenticated
1. Authenticated (User)
2. HostPrivilege (MMS provider + User)
3. Administrator (Privilege distributor + MMS provider + User)