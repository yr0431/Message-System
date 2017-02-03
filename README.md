# Message-System
   
   Heroku link: https://messagesystem.herokuapp.com/
    
   Using MongoDB Hosting as database, no need of any configuration to test the application.
   
 * Random users and messages data are generated to test the features.
 * Original data files are stored in folder--data files in JSON format. 
    * - user data are shown with real password. Only for test use.
    
    
## features
* Login & Sign up page
  * password verification
    * - at least 8 characters, at least one letter, at least one number
    * - password confirmation
  * safety
    * - user information stored in cookies are dealed with tokenization
    * - only password hashes are stored in the password, not the real password
* Profile Page
  * user info update
    * - identity verification using current password
    * - user avatar visible before submit
* Message Page
  * mark as important, using red flag
  * disable sender from changing important flag of the message
  * disable sender from deleting the message
  * user's existence checked before submitting new message
  
## issues for now
* Login & Sign up page
  * validation issues(data schema used at server side, bad data won't infect the database)
    * "remenber me" not available yet
    * username depulication validation not available yet
    * phone number validation not abailable yet
* Profile Page
  * update
    * force the user to log in again after updating information, need to improve
    * '#' and '.html' in url, need to be changed to route
* Message Page
  * avatar in old messages won't update with user info update, message stored in a different collection with user
  * message detail will lost after refreshing page
  * random problems may occur with unexpected manipulation
  * '#' and '.html' in url, need to be changed to route

